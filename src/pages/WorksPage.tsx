import { useMemo, useState } from "react";
import { COLOR_TAGS, WORK_CATEGORIES, type ColorTag, type WorkCategory } from "../types";
import { WorkGrid } from "../components/WorkGrid";
import { usePortfolio } from "../lib/portfolio-context";

type CategoryFilter = WorkCategory | "All";
type TagFilter = ColorTag | "All";

export function WorksPage() {
  const { works } = usePortfolio();
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [tag, setTag] = useState<TagFilter>("All");

  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchesCategory = category === "All" || work.category === category;
      const matchesTag = tag === "All" || work.colorTags.includes(tag);
      return matchesCategory && matchesTag;
    });
  }, [category, tag, works]);

  return (
    <div className="stack-lg">
      <section className="stack-sm">
        <p className="eyebrow">Works</p>
        <h1 className="page-title">Projects arranged with room to breathe</h1>
        <p className="page-intro">
          Filter by theme or color mood. The grid stays measured and quiet so the
          images carry the page.
        </p>
      </section>

      <section className="filter-row" aria-label="Work filters">
        <label className="field">
          <span>Theme</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryFilter)}
          >
            <option value="All">All</option>
            {WORK_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Color</span>
          <select value={tag} onChange={(event) => setTag(event.target.value as TagFilter)}>
            <option value="All">All</option>
            {COLOR_TAGS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      <WorkGrid works={filteredWorks} />
    </div>
  );
}
