import express from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { allowRoles } from '../../middlewares/rbac.middleware.js';
import {
  getAllUsers, getUserById, updateUserRole, deleteUser,
  getAllDoctors, getDoctorById, verifyDoctor,
  getAllPatients, getPatientById,
  getAllAppointments, getAppointmentById, updateAppointmentStatus,
  getAllPrescriptions,
  getAllMedicalRecords,
  getAllPayments, refundPayment,
  getAllPayouts, updatePayoutStatus,
  getAllReviews, deleteReview,
  getAllNotifications, sendNotification,
  getAuditLogs,
  getPlatformSettings, updateCommissionRate,
  getAnalytics
} from './admin.controller.js';

const router = express.Router();
router.use(protect, allowRoles('ADMIN'));

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Doctors
router.get('/doctors', getAllDoctors);
router.get('/doctors/:id', getDoctorById);
router.patch('/doctors/:doctorId/verify', verifyDoctor);

// Patients
router.get('/patients', getAllPatients);
router.get('/patients/:id', getPatientById);

// Appointments
router.get('/appointments', getAllAppointments);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// Prescriptions
router.get('/prescriptions', getAllPrescriptions);

// Medical records
router.get('/medical-records', getAllMedicalRecords);

// Payments
router.get('/payments', getAllPayments);
router.patch('/payments/:paymentId/refund', refundPayment);

// Payouts
router.get('/payouts', getAllPayouts);
router.patch('/payouts/:id/status', updatePayoutStatus);

// Reviews
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Notifications
router.get('/notifications', getAllNotifications);
router.post('/notifications/send', sendNotification);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Settings
router.get('/settings', getPlatformSettings);
router.patch('/settings/commission', updateCommissionRate);

// Analytics
router.get('/analytics', getAnalytics);

export default router;