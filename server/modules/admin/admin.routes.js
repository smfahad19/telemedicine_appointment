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

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/doctors', getAllDoctors);
router.get('/doctors/:id', getDoctorById);
router.patch('/doctors/:doctorId/verify', verifyDoctor);

router.get('/patients', getAllPatients);
router.get('/patients/:id', getPatientById);

router.get('/appointments', getAllAppointments);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/status', updateAppointmentStatus);

router.get('/prescriptions', getAllPrescriptions);

router.get('/medical-records', getAllMedicalRecords);

router.get('/payments', getAllPayments);
router.patch('/payments/:paymentId/refund', refundPayment);

router.get('/payouts', getAllPayouts);
router.patch('/payouts/:id/status', updatePayoutStatus);

router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

router.get('/notifications', getAllNotifications);
router.post('/notifications/send', sendNotification);

router.get('/audit-logs', getAuditLogs);

router.get('/settings', getPlatformSettings);
router.patch('/settings/commission', updateCommissionRate);
router.get('/analytics', getAnalytics);

export default router;