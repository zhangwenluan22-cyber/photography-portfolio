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
    hasDraftChanges,
    embeddedMediaCount
  } = usePortfolio();
  const [answer, setAnswer] = useState("");
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
    const success = login(answer);

    if (!success) {
      setError("That answer does not unlock this room.");
      return;
    }

    setAnswer("");
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

  const handlePhotoPathChange = (
    photoId: string,
    field: "src" | "livePhotoVideo",
    value: string
  ) => {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              [field]: value.trim() || undefined
            }
          : photo
      )
    );
  };

  const handlePhotoAltChange = (photoId: string, value: string) => {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              alt: value
            }
          : photo
      )
    );
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
            Only the admin page contains upload, edit, and delete controls. For now,
            a private question keeps this room for the right person.
          </p>
        </div>

        <form className="admin-login" onSubmit={handleLogin}>
          <p className="muted-text">
            Prompt: <code>{siteConfig.adminQuestion}</code>
          </p>
          <label className="field">
            <span>Answer</span>
            <input
              type="password"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer"
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="primary-button">
            Unlock admin
          </button>
          <p className="muted-text">
            Change the prompt and answer in <code>src/data/siteContent.ts</code>
            before publishing.
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
            <h2 className="section-title">How this page works</h2>
            <p className="muted-text">
              This page should feel simple: choose a theme, add photos, write a short
              title, then save. Everything else is optional.
            </p>
          </div>
        </div>

        <ol className="admin-quick-steps">
          <li>Choose the theme that fits the photos.</li>
          <li>Upload one or more images.</li>
          <li>Add a title and a short description.</li>
          <li>Click <strong>Create work</strong> to save it.</li>
        </ol>

        <p className="error-text">
          Browser uploads are draft-only. To publish photos on the live site, place
          them in the site folders first.
        </p>
      </section>

      <section className="stack-md">
        <div className="section-head">
          <div>
            <h2 className="section-title">Save and sync</h2>
            <p className="muted-text">
              Edits made here are saved in this browser first. When you are happy with
              them, you can export the latest version and replace the site data.
            </p>
          </div>
          <p className="muted-text">
            {hasDraftChanges ? "You have unsynced draft changes." : "This draft matches the current site data."}
          </p>
        </div>

        <p className="muted-text">
          {embeddedMediaCount > 0
            ? `This draft still contains ${embeddedMediaCount} browser-uploaded media item(s).`
            : "This draft is using file-based media cleanly."}
        </p>

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
          Export gives you the latest draft as a <code>works.json</code> file.
        </p>

        <p className="muted-text">
          If you prefer a cleaner long-term workflow, you can keep images in the site
          folders and use file paths instead of browser uploads.
        </p>

        {syncMessage ? <p className="muted-text">{syncMessage}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <details className="admin-advanced" open={editingId ? true : undefined}>
        <summary className="admin-advanced-summary">
          {editingId ? "Advanced editor: open" : "Open advanced editor"}
        </summary>

        <section className="stack-md">
          <div className="section-head">
            <div>
              <h2 className="section-title">
                {editingId ? "Edit project" : "Add new project"}
              </h2>
              <p className="muted-text">
                Most fields here are optional. If you are in a hurry, title,
                description, theme, and photos are enough.
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
                <small>
                  {isUploading ? "Compressing images..." : "Upload multiple images"}
                </small>
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
                <input
                  name="shutter"
                  value={formValues.shutter}
                  onChange={handleFieldChange}
                />
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
                    {photo.src ? (
                      <img src={photo.src} alt={photo.alt || "Photo preview"} />
                    ) : (
                      <div className="preview-placeholder">No image source yet</div>
                    )}
                    <label className="field">
                      <span>Image source</span>
                      <input
                        value={photo.src}
                        onChange={(event) =>
                          handlePhotoPathChange(photo.id, "src", event.target.value)
                        }
                        placeholder="/uploads/series/photo-01.jpg"
                      />
                    </label>
                    <label className="field">
                      <span>Alt text</span>
                      <input
                        value={photo.alt}
                        onChange={(event) => handlePhotoAltChange(photo.id, event.target.value)}
                        placeholder="Describe the photograph"
                      />
                    </label>
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
                    <label className="field">
                      <span>Live clip path</span>
                      <input
                        value={photo.livePhotoVideo ?? ""}
                        onChange={(event) =>
                          handlePhotoPathChange(photo.id, "livePhotoVideo", event.target.value)
                        }
                        placeholder="/uploads/series/photo-01.mp4"
                      />
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

            <p className="muted-text">
              {editingId
                ? "Save changes updates this draft."
                : "Create work saves this new draft."}
            </p>

            <button type="submit" className="primary-button">
              {editingId ? "Save changes" : "Create work"}
            </button>
          </form>
        </section>
      </details>

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
