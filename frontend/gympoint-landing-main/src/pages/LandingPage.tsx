import { Footer, Header, Main } from "../components/layout"
import { About, Contact, Features, GymRegister, Hero, SocialMedia, Testimonials } from "../components/sections"

export const LandingPage = () => {

  return (
    <>
      <Header />
      <Main>
        <Hero />
        <Features />
        <About />
        <Testimonials />
        <GymRegister />
        <SocialMedia />
        <Contact />
      </Main>
      <Footer />
    </>
  );
};