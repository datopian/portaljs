import { Header } from '../Header';
import Footer from './Footer';
import TopBanner from './TopBanner';

export default function Layout({ children }) {
  return (
    <div className="bg-white min-h-screen">
      <TopBanner
        title="Announcing PortalJS Cloud 🌀"
        text="the easiest way to spin up a managed, open-source Open Data Portal. Start building today at portaljs.com"
        link='https://portaljs.com'
        buttonLabel="Start now"
      />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
