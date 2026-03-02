import React from 'react';
import { motion } from 'framer-motion';
import './WeddingInvitation.css';
import MainPage from './MainPage';

const WeddingInvitation = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      <MainPage />
    </motion.div>
  );
};

export default WeddingInvitation;
