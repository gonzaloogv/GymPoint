import Navbar from '../../components/Navbar/Navbar';
import HeroSection from '../../components/HeroSection/HeroSection';
import AboutUs from '../../components/AboutUs/AboutUs';
import Features from '../../components/Features/Features';
import Testimonials from '../../components/Testimonials/Testimonials';
import SocialLinks from '../../components/SocialLinks/SocialLinks';
import Footer from '../../components/Footer/Footer';
import MapSection from '../../components/MapSection/MapSection';

function Landing() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <MapSection />
      <AboutUs />
      <Features />
      <Testimonials />
      <SocialLinks />
      <Footer />
    </>
  );
}

export default Landing;