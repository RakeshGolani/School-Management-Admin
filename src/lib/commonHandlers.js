import Notiflix from 'notiflix';
import { deleteSchoolAction, toggleSchoolStatusAction } from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';

// Initialize Notiflix with dark theme globally for Super Admin
if (typeof window !== 'undefined') {
  Notiflix.Confirm.init({
    className: 'notiflix-confirm',
    width: '340px',
    zindex: 4000,
    position: 'center',
    distance: '10px',
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    backOverlay: true,
    backOverlayColor: 'rgba(2, 6, 23, 0.7)',
    fontFamily: 'inherit',
    cssAnimation: true,
    cssAnimationDuration: 300,
    cssAnimationStyle: 'zoom',
    plainText: true,
    titleColor: '#f8fafc',
    titleFontSize: '18px',
    messageColor: '#94a3b8',
    messageFontSize: '14px',
    okButtonColor: '#f8fafc',
    okButtonBackground: '#e11d48',
    cancelButtonColor: '#cbd5e1',
    cancelButtonBackground: '#1e293b',
  });
}

/**
 * Handle Generic Delete Action with Notiflix Confirmation
 */
export const handleConfirmDelete = (module, id, onSuccess) => {
  Notiflix.Confirm.show(
    'Confirm Deletion',
    `Are you sure you want to delete this ${module}? This action cannot be undone.`,
    'Yes, Delete',
    'Cancel',
    async () => {
      try {
        const result = await deleteSchoolAction(id);
        if (result.success) {
          notifySuccess(result.message || `${module} deleted successfully`);
          if (onSuccess) onSuccess();
        } else {
          notifyError(result.message || `Failed to delete ${module}`);
        }
      } catch (err) {
        notifyError('An unexpected error occurred.');
      }
    },
    () => {}
  );
};

/**
 * Handle Generic Status Update
 */
export const handleStatusToggle = async (module, id, status, onSuccess) => {
  try {
    const result = await toggleSchoolStatusAction(id, status);
    if (result.success) {
      notifySuccess(result.message || `${module} status updated to ${status}`);
      if (onSuccess) onSuccess();
    } else {
      notifyError(result.message || `Failed to update ${module} status`);
    }
  } catch (err) {
    notifyError('An unexpected error occurred.');
  }
};

/**
 * Format Phone Number with space after country code +91
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let str = String(phone).trim();
  if (!str) return '';
  if (str.startsWith('+91')) {
    if (!str.startsWith('+91 ')) {
      return str.replace(/^\+91\s*/, '+91 ');
    }
    return str;
  }
  if (str.startsWith('+')) {
    return str;
  }
  return `+91 ${str}`;
};
