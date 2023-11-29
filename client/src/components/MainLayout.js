import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderComponent from './HeaderComponent.js';
import SidebarComponent from './SidebarComponent.js';

const MainLayout = () => {
  return (
    <div>
      <HeaderComponent />
      <SidebarComponent />
      <Outlet /> {/* This will render the matched child route */}
    </div>
  );
};

export default MainLayout;
