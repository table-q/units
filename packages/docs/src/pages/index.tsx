import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import clsx from 'clsx';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary')} style={{ padding: '4rem 0' }}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <Layout description="Exact-arithmetic financial math using BigInt rationals">
      <HomepageHeader />
      <main style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="row">
            <div className="col col--4">
              <h3>Exact Arithmetic</h3>
              <p>
                Every number is a BigInt rational — no floats, no rounding errors.
                <code>1/3 * 3 = 1</code>, always.
              </p>
            </div>
            <div className="col col--4">
              <h3>Type-Safe Units</h3>
              <p>
                GBP + EUR is a compile-time error. Unsigned values reject negatives at both the type
                level and runtime.
              </p>
            </div>
            <div className="col col--4">
              <h3>Extensible</h3>
              <p>
                Add custom methods to all values via the plugin system. BigNumber.js, custom
                rounding constraints, and more.
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
