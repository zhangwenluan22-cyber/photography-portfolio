import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteContent";
import { usePortfolio } from "../lib/portfolio-context";
import { WorkGrid } from "../components/WorkGrid";

export function HomePage() {
  const { works } = usePortfolio();
  const featuredWorks = works
    .filter((item) => item.featured)
    .sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999))
    .slice(0, 3);

  return (
    <div className="stack-xl">
      <section className="hero-section">
        <p className="eyebrow">Home</p>
        <h1 className="hero-title">{siteConfig.homeHeadline}</h1>
        <p className="hero-text">{siteConfig.homeIntro}</p>
      </section>

      <section className="stack-md">
        <div className="section-head">
          <div>
            <p className="eyebrow">Selected Works</p>
            <h2 className="section-title">A restrained edit of recent series</h2>
          </div>
          <Link to="/works" className="text-link">
            View all works
          </Link>
        </div>
        <WorkGrid works={featuredWorks} emptyText="Mark a few works as featured to show them here." />
      </section>
    </div>
  );
}
