const Avatar = () => {
  return (
    <div>
      <video
        src="videos/serious.mp4"
        autoPlay
        muted
        loop
        className="object-cover rounded-full w-96 h-96"
      />

      <button className="px-2 text-pink-700 border py1">Interact</button>
    </div>
  );
};

export default Avatar;
