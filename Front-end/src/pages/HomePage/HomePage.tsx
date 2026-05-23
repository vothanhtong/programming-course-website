import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import CoursesSection from '../../components/CoursesSection/CoursesSection';
import Contact from '../../components/Contact/Contact';
import Footer from '../../components/Footer/Footer';

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
