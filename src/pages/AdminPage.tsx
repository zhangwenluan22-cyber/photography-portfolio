import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { COLOR_TAGS, WORK_CATEGORIES, type AdminWorkFormValues, type ColorTag, type Work, type WorkPhoto } from "../types";
import { usePortfolio } from "../lib/portfolio-context";
import { fileToVideoDataUrl, filesToWorkPhotos } from "../lib/image-utils";
import { siteConfig } from "../data/siteContent";

const emptyForm: AdminWorkFormValues = {
  title: "",
  subtitle: "",
  description: "",
  category: "Nature",
  colorTags: [],
  location: "",
  date: "",
  camera: "",
  lens: "",
  iso: "",
  shutter: "",
  aperture: "",
  focalLength: ""
};

function mapWorkToForm(work: Work): AdminWorkFormValues {
  return {
    title: work.title,
    subtitle: work.subtitle ?? "",
    description: work.description,
    category: work.category,
    colorTags: work.colorTags,
    location: work.location ?? "",
    date: work.date ?? "",
    camera: work.cameraSettings?.camera ?? "",
    lens: work.cameraSettings?.lens ?? "",
    iso: work.cameraSettings?.iso ?? "",
    shutter: work.cameraSettings?.shutter ?? "",
    aperture: work.cameraSettings?.aperture ?? "",
    focalLength: work.cameraSettings?.focalLength ?? ""
  };
}

export function AdminPage() {
  const {
    works,
    isAdminAuthenticated,
    login,
    logout,
    saveWorkItem,
    deleteWorkItem,
    exportWorksJson,
    importWorksJson,
    resetWorksToRepository,
    hasDraftChanges
  } = usePortfolio();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<AdminWorkFormValues>(emptyForm);
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const editingWork = useMemo(
    () => works.find((item) => item.id === editingId) ?? null,
    [editingId, works]
  );

  const resetEditor = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setPhotos([]);
    setError("");
  };

  const handleExportJson = () => {
    const file = new Blob([exportWorksJson()], { type: "application/json" });
    const url = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "works.json";
    link.click();
    window.URL.revokeObjectURL(url);
    setSyncMessage(
      "Downloaded works.json. Replace src/data/works.json with this file, then commit and push."
    );
  };

  const handleImportJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      importWorksJson(raw);
      setSyncMessage("JSON imported into the current draft.");
      setError("");
    } catch (importError) {
      const message =
        importError instanceof Error ? importError.message : "Failed to import JSON.";
      setError(message);
    }

    event.target.value = "";
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = login(password);

    if (!success) {
      setError("Password is incorrect.");
      return;
    }

    setPassword("");
    setError("");
  };

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleTagToggle = (tag: ColorTag) => {
    setFormValues((current) => {
      const exists = current.colorTags.includes(tag);
      return {
        ...current,
        colorTags: exists
          ? current.colorTags.filter((item) => item !== tag)
          : [...current.colorTags, tag]
      };
    });
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }

    setIsUploading(true);
    const nextPhotos = await filesToWorkPhotos(event.target.files);
    setPhotos((current) => [...current, ...nextPhotos]);
    setIsUploading(false);
    event.target.value = "";
  };

  const handlePhotoRemove = (photoId: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  };

  const handleLiveClipUpload = async (photoId: string, file?: File) => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    const videoSrc = await fileToVideoDataUrl(file);
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              livePhotoVideo: videoSrc
            }
          : photo
      )
    );
    setIsUploading(false);
  };

  const handleLiveClipRemove = (photoId: string) => {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              livePhotoVideo: undefined
            }
          : photo
      )
    );
  };

  const startEdit = (work: Work) => {
    setEditingId(work.id);
    setFormValues(mapWorkToForm(work));
    setPhotos(work.photos);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.title.trim() || !formValues.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (!photos.length) {
      setError("Please upload at least one image.");
      return;
    }

    saveWorkItem(
      {
        ...formValues,
        photos
      },
      editingId ?? undefined
    );

    resetEditor();
  };

  if (!isAdminAuthenticated) {
    return (
      <section className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Admin</p>
          <h1 className="page-title">Private editing access</h1>
          <p className="page-intro narrow-copy">
            Only the admin page contains upload, edit, and delete controls. For a
            later production launch, you can replace this simple password gate with
            a proper auth system.
          </p>
        </div>

        <form className="admin-login" onSubmit={handleLogin}>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="primary-button">
            Enter admin
          </button>
          <p className="muted-text">
            Default password: <code>{siteConfig.adminPassword}</code>. Change it in
            <code> src/data/siteContent.ts</code> before publishing.
          </p>
        </form>
      </section>
    );
  }

  return (
    <div className="stack-xl">
      <section className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="page-title">Manage works</h1>
        </div>
        <button type="button" className="secondary-button" onClick={logout}>
          Log out
        </button>
      </section>

      <section className="stack-md">
        <div className="section-head">
          <div>
            <h2 className="section-title">Content sync</h2>
            <p className="muted-text">
              The site now treats repository JSON as the long-term source of truth.
              Draft edits stay in this browser until you export them back to
              <code> src/data/works.json</code>, commit, and push.
            </p>
          </div>
          <p className="muted-text">
            {hasDraftChanges ? "Draft differs from repository JSON." : "Draft matches repository JSON."}
          </p>
        </div>

        <div className="admin-sync-actions">
          <button type="button" className="secondary-button" onClick={handleExportJson}>
            Export works.json
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => importInputRef.current?.click()}
          >
            Import works.json
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              resetWorksToRepository();
              setSyncMessage("Draft reset to repository JSON.");
            }}
          >
            Reset to repository JSON
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            onChange={handleImportJson}
          />
        </div>

        <p className="muted-text">
          Cross-computer workflow: export <code>works.json</code>, replace
          <code>src/data/works.json</code> with the downloaded file, then run
          <code>git add .</code>, <code>git commit</code>, and <code>git push</code>.
        </p>

        {syncMessage ? <p className="muted-text">{syncMessage}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="stack-md">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              {editingId ? "Edit project" : "Add new project"}
            </h2>
            <p className="muted-text">
              Uploaded photos and live clips are still kept in the browser while you
              edit. Exporting JSON lets you move the metadata and embedded media to
              another computer through Git.
            </p>
          </div>
          {editingId ? (
            <button type="button" className="secondary-button" onClick={resetEditor}>
              Cancel editing
            </button>
          ) : null}
        </div>

        <form className="admin-form stack-md" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Title</span>
              <input
                name="title"
                value={formValues.title}
                onChange={handleFieldChange}
                placeholder="Series title"
              />
            </label>

            <label className="field">
              <span>Subtitle</span>
              <input
                name="subtitle"
                value={formValues.subtitle}
                onChange={handleFieldChange}
                placeholder="Optional subtitle"
              />
            </label>

            <label className="field">
              <span>Theme</span>
              <select
                name="category"
                value={formValues.category}
                onChange={handleFieldChange}
              >
                {WORK_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Date</span>
              <input
                type="date"
                name="date"
                value={formValues.date}
                onChange={handleFieldChange}
              />
            </label>

            <label className="field">
              <span>Location</span>
              <input
                name="location"
                value={formValues.location}
                onChange={handleFieldChange}
                placeholder="Optional location"
              />
            </label>

            <label className="field field-file">
              <span>Photos</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
              <small>{isUploading ? "Compressing images..." : "Upload multiple images"}</small>
            </label>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleFieldChange}
              rows={6}
              placeholder="Write a short note about the work"
            />
          </label>

          <fieldset className="tag-selector">
            <legend>Color tags</legend>
            <div className="tag-options">
              {COLOR_TAGS.map((tag) => (
                <label key={tag} className="check-tag">
                  <input
                    type="checkbox"
                    checked={formValues.colorTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-grid">
            <label className="field">
              <span>Camera</span>
              <input name="camera" value={formValues.camera} onChange={handleFieldChange} />
            </label>
            <label className="field">
              <span>Lens</span>
              <input name="lens" value={formValues.lens} onChange={handleFieldChange} />
            </label>
            <label className="field">
              <span>ISO</span>
              <input name="iso" value={formValues.iso} onChange={handleFieldChange} />
            </label>
            <label className="field">
              <span>Shutter</span>
              <input name="shutter" value={formValues.shutter} onChange={handleFieldChange} />
            </label>
            <label className="field">
              <span>Aperture</span>
              <input
                name="aperture"
                value={formValues.aperture}
                onChange={handleFieldChange}
              />
            </label>
            <label className="field">
              <span>Focal Length</span>
              <input
                name="focalLength"
                value={formValues.focalLength}
                onChange={handleFieldChange}
              />
            </label>
          </div>

          {photos.length ? (
            <div className="photo-preview-grid">
              {photos.map((photo) => (
                <figure key={photo.id} className="preview-item">
                  <img src={photo.src} alt={photo.alt} />
                  <label className="field field-file">
                    <span>Live clip</span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/*"
                      onChange={(event) =>
                        handleLiveClipUpload(photo.id, event.target.files?.[0])
                      }
                    />
                    <small>
                      {photo.livePhotoVideo
                        ? "Live clip attached"
                        : "Optional short video for long-press preview"}
                    </small>
                  </label>
                  {photo.livePhotoVideo ? (
                    <button
                      type="button"
                      className="text-link danger-link"
                      onClick={() => handleLiveClipRemove(photo.id)}
                    >
                      Remove live clip
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-link danger-link"
                    onClick={() => handlePhotoRemove(photo.id)}
                  >
                    Remove
                  </button>
                </figure>
              ))}
            </div>
          ) : null}

          <button type="submit" className="primary-button">
            {editingId ? "Save changes" : "Create work"}
          </button>
        </form>
      </section>

      <section className="stack-md">
        <h2 className="section-title">Existing works</h2>
        <div className="admin-list">
          {works.map((work) => (
            <article key={work.id} className="admin-list-item">
              <img src={work.photos[0]?.src} alt={work.title} className="admin-thumb" />
              <div className="admin-list-copy">
                <p className="work-category">{work.category}</p>
                <h3>{work.title}</h3>
                <p className="muted-text">{work.subtitle || work.description}</p>
              </div>
              <div className="admin-list-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => startEdit(work)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="secondary-button danger-button"
                  onClick={() => deleteWorkItem(work.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editingWork ? <p className="muted-text">Currently editing: {editingWork.title}</p> : null}
    </div>
  );
}
