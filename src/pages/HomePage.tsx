import React from 'react';
import Header from '../components/Header';
import HeroSlider from '../components/HeroSlider';
import ContactsStrip from '../components/ContactsStrip';
import PhotographerInfo from '../components/PhotographerInfo';
import AlbumsGallery from '../components/AlbumsGallery';
import EventsSchedule from '../components/EventsSchedule';
import ReviewsSection from '../components/ReviewsSection';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />
      <HeroSlider />
      <ContactsStrip />
      <PhotographerInfo />
      <AlbumsGallery />
      <EventsSchedule />
      <ReviewsSection />
      <Footer />
    </div>
  );
}

export default HomePage;