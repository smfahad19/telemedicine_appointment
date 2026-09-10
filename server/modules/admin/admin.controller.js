import prisma from '../../config/db.js';

// ==================== USERS ====================

export const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const users = await prisma.user.findMany({
            where: role ? { role } : {},
            select: { id: true, name: true, email: true, role: true, phone: true, profileImage: true, createdAt: true }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                doctorProfile: { include: { documents: true, availability: true } },
                appointments: true,
                medicalRecords: true,
                reviews: true
            }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await prisma.user.update({ where: { id }, data: { role } });

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: `Changed role to ${role}`, targetType: 'User', targetId: id }
        });

        res.status(200).json({ message: 'User role updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: 'Deleted user', targetType: 'User', targetId: id }
        });

        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== DOCTORS ====================

export const getAllDoctors = async (req, res) => {
    try {
        const { status } = req.query; // PENDING / APPROVED / REJECTED
        const doctors = await prisma.doctorProfile.findMany({
            where: status ? { isVerified: status } : {},
            include: { user: { select: { name: true, email: true, phone: true, profileImage: true } }, documents: true }
        });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await prisma.doctorProfile.findUnique({
            where: { id },
            include: { user: true, documents: true, availability: true, appointments: true, reviews: true, payouts: true }
        });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const verifyDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { status } = req.body;

        const doctor = await prisma.doctorProfile.update({ where: { id: doctorId }, data: { isVerified: status } });

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: `Doctor ${status.toLowerCase()}`, targetType: 'DoctorProfile', targetId: doctorId }
        });

        res.status(200).json({ message: `Doctor ${status.toLowerCase()} successfully`, doctor });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== PATIENTS ====================

export const getAllPatients = async (req, res) => {
    try {
        const patients = await prisma.user.findMany({
            where: { role: 'PATIENT' },
            select: { id: true, name: true, email: true, phone: true, profileImage: true, createdAt: true }
        });
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await prisma.user.findUnique({
            where: { id },
            include: { appointments: true, medicalRecords: true, reviews: true }
        });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== APPOINTMENTS ====================

export const getAllAppointments = async (req, res) => {
    try {
        const { status } = req.query;
        const appointments = await prisma.appointment.findMany({
            where: status ? { status } : {},
            include: {
                patient: { select: { name: true, email: true } },
                doctor: { include: { user: { select: { name: true, email: true } } } },
                payment: true
            },
            orderBy: { scheduledAt: 'desc' }
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: { include: { user: true } },
                consultation: true,
                prescription: true,
                payment: true,
                review: true,
                chatMessages: true
            }
        });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await prisma.appointment.update({ where: { id }, data: { status } });

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: `Appointment status set to ${status}`, targetType: 'Appointment', targetId: id }
        });

        res.status(200).json({ message: 'Appointment status updated', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== PRESCRIPTIONS ====================

export const getAllPrescriptions = async (req, res) => {
    try {
        const prescriptions = await prisma.prescription.findMany({
            include: {
                appointment: {
                    include: {
                        patient: { select: { name: true, email: true } },
                        doctor: { include: { user: { select: { name: true } } } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== MEDICAL RECORDS ====================

export const getAllMedicalRecords = async (req, res) => {
    try {
        const { patientId } = req.query;
        const records = await prisma.medicalRecord.findMany({
            where: patientId ? { patientId } : {},
            include: { patient: { select: { name: true, email: true } } }
        });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== PAYMENTS ====================

export const getAllPayments = async (req, res) => {
    try {
        const { status } = req.query;
        const payments = await prisma.payment.findMany({
            where: status ? { status } : {},
            include: {
                appointment: {
                    include: {
                        patient: { select: { name: true, email: true } },
                        doctor: { include: { user: { select: { name: true } } } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;

        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'REFUNDED', refundReason: reason, refundedAt: new Date() }
        });

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: 'Refunded payment', targetType: 'Payment', targetId: paymentId }
        });

        res.status(200).json({ message: 'Payment refunded', payment });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== PAYOUTS ====================

export const getAllPayouts = async (req, res) => {
    try {
        const { status } = req.query;
        const payouts = await prisma.payout.findMany({
            where: status ? { status } : {},
            include: { doctor: { include: { user: { select: { name: true, email: true } } } } },
            orderBy: { requestedAt: 'desc' }
        });
        res.status(200).json(payouts);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const updatePayoutStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // PROCESSING / PAID / REJECTED

        const payout = await prisma.payout.update({
            where: { id },
            data: { status, processedAt: status === 'PAID' ? new Date() : null }
        });

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: `Payout set to ${status}`, targetType: 'Payout', targetId: id }
        });

        res.status(200).json({ message: 'Payout status updated', payout });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== REVIEWS ====================

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            include: { patient: { select: { name: true } }, doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({ where: { id } });

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: 'Deleted review', targetType: 'Review', targetId: id }
        });

        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== NOTIFICATIONS ====================

export const getAllNotifications = async (req, res) => {
    try {
        const { userId } = req.query;
        const notifications = await prisma.notification.findMany({
            where: userId ? { userId } : {},
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const sendNotification = async (req, res) => {
    try {
        const { userId, type, message } = req.body;
        const notification = await prisma.notification.create({ data: { userId, type, message } });
        res.status(201).json({ message: 'Notification sent', notification });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== AUDIT LOGS ====================

export const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: { admin: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== PLATFORM SETTINGS ====================

export const getPlatformSettings = async (req, res) => {
    try {
        let settings = await prisma.platformSetting.findFirst();
        if (!settings) settings = await prisma.platformSetting.create({ data: {} });
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const updateCommissionRate = async (req, res) => {
    try {
        const { commissionRate } = req.body;
        let settings = await prisma.platformSetting.findFirst();

        if (!settings) {
            settings = await prisma.platformSetting.create({ data: { commissionRate } });
        } else {
            settings = await prisma.platformSetting.update({ where: { id: settings.id }, data: { commissionRate } });
        }

        await prisma.auditLog.create({
            data: { adminId: req.user.userId, action: 'Updated commission rate', targetType: 'PlatformSetting', targetId: settings.id }
        });

        res.status(200).json({ message: 'Commission rate updated', settings });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// ==================== ANALYTICS ====================

export const getAnalytics = async (req, res) => {
    try {
        const [totalPatients, totalDoctors, totalAppointments, completedAppointments, totalRevenue, pendingPayouts] = await Promise.all([
            prisma.user.count({ where: { role: 'PATIENT' } }),
            prisma.user.count({ where: { role: 'DOCTOR' } }),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: 'COMPLETED' } }),
            prisma.payment.aggregate({ _sum: { platformFee: true }, where: { status: 'PAID' } }),
            prisma.payout.count({ where: { status: 'REQUESTED' } })
        ]);

        res.status(200).json({
            totalPatients,
            totalDoctors,
            totalAppointments,
            completedAppointments,
            totalPlatformRevenue: totalRevenue._sum.platformFee || 0,
            pendingPayouts
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};