import { usePortfolio } from "../lib/portfolio-context";
import { formatDisplayDate } from "../lib/utils";

export function JournalPage() {
  const { journalEntries } = usePortfolio();

  return (
    <div className="stack-lg">
      <section className="stack-sm">
        <p className="eyebrow">Journal</p>
        <h1 className="page-title">Short notes around looking and returning</h1>
        <p className="page-intro">
          A quiet place for process, observation, and the thoughts that sit behind
          a photograph.
        </p>
      </section>

      <div className="journal-list">
        {journalEntries.map((entry) => (
          <article key={entry.id} className="journal-entry">
            <p className="journal-date">{formatDisplayDate(entry.date)}</p>
            <h2>{entry.title}</h2>
            <p className="journal-excerpt">{entry.excerpt}</p>
            <div className="stack-sm">
              {entry.content.map((paragraph) => (
                <p key={paragraph} className="body-copy">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
