import React, { useState } from "react";
type ProfileItemProps = {
  route: string;
  name: string;
  remove?: (personId: number) => void;
  toggle?: (itemId: number, personId: number) => void;
  id: number | string;
};

const ProfileItem: React.FC<ProfileItemProps> = ({
  name,
  remove,
  route,
  id,
  toggle,
}) => {
  const [showRemove, setShowRemove] = useState(false);

  const handleClick = () => {
    if (!showRemove) {
      setShowRemove(true);
      setTimeout(() => setShowRemove(false), 2000); // auto-hide X after 2s
    } else {
      setShowRemove(false);
    }
  };

  return (
    <div
      className="flex items-center cursor-pointer flex-col justify-center text-gray-600 hover:bg-gray-100 rounded-lg relative"
      onClick={handleClick}
    >
      <img
        src={route || "/default-avatar.png"}
        alt={name || "Person"}
        className="w-10 h-10 rounded-full"
        style={{ opacity: showRemove ? 0.5 : 1 }}
      />
      <span className="text-sm text-gray-800">{name || "Unknown"}</span>
      {showRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (remove) remove(id as number);
            if (toggle) toggle(id as number, id as number);
          }}
          className="absolute bottom-1/2 rounded-full text-red-600 font-bold text-3xl pointer-events-auto cursor-pointer"
          style={{ left: "50%", transform: "translate(-50%, 50%)" }}
        >
          ×
        </span>
      )}
    </div>
  );
};

export default ProfileItem;
