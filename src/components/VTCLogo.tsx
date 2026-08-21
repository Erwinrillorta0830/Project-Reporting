import React from 'react';

interface VTCLogoProps {
  className?: string;
}

export const VTCLogoEmblem: React.FC<VTCLogoProps> = ({ className = "w-16 h-16" }) => {
  return (
    <img 
      src="/Logo.png" 
      alt="VERTEX TECHNOLOGIES Logo Emblem" 
      className={`${className} object-contain`}
    />
  );
};

export const VTCFullHeaderLogo: React.FC<VTCLogoProps> = ({ className = "h-16" }) => {
  return (
    <img 
      src="/Header Document Vertex.png" 
      alt="VERTEX TECHNOLOGIES CORPORATION" 
      className={`${className} object-contain`}
    />
  );
};
