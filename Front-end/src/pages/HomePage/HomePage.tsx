import React from 'react';
import Navbar from '../../components/layout/Navbar/Navbar';
import Hero from '../../components/ui/Hero/Hero';
import Features from '../../components/ui/Features/Features';
import CoursesSection from '../../components/ui/CoursesSection/CoursesSection';
import Contact from '../../components/ui/Contact/Contact';
import Footer from '../../components/layout/Footer/Footer';

const HomePage: React.FC = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Features />
      <CoursesSection />
      <Contact />
    </main>
    <Footer />
  </>
);

export default HomePage;
