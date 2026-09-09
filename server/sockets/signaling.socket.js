export const signalingHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (appointmentId) => {
      socket.join(appointmentId);
      socket.to(appointmentId).emit('user-joined', socket.id);
    });

    socket.on('offer', ({ appointmentId, offer }) => {
      socket.to(appointmentId).emit('offer', offer);
    });

    socket.on('answer', ({ appointmentId, answer }) => {
      socket.to(appointmentId).emit('answer', answer);
    });

    socket.on('ice-candidate', ({ appointmentId, candidate }) => {
      socket.to(appointmentId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};