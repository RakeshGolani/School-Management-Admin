import Notiflix from 'notiflix';

// Configure Notiflix Notify Defaults
if (typeof window !== 'undefined') {
  Notiflix.Notify.init({
    width: '320px',
    position: 'right-top',
    distance: '16px',
    opacity: 1,
    borderRadius: '12px',
    fontFamily: 'inherit',
    fontSize: '13px',
    cssAnimation: true,
    cssAnimationDuration: 300,
    cssAnimationStyle: 'fade',
    closeButton: false,
    useIcon: true,
    textColor: '#ffffff',
    success: {
      background: '#059669',
      iconColor: '#ffffff'
    },
    failure: {
      background: '#e11d48',
      iconColor: '#ffffff'
    },
    warning: {
      background: '#d97706',
      iconColor: '#ffffff'
    },
    info: {
      background: '#2563eb',
      iconColor: '#ffffff'
    }
  });
}

export const notifySuccess = (message) => {
  if (typeof window !== 'undefined') {
    Notiflix.Notify.success(message);
  }
};

export const notifyError = (message) => {
  if (typeof window !== 'undefined') {
    Notiflix.Notify.failure(message);
  }
};

export const notifyWarning = (message) => {
  if (typeof window !== 'undefined') {
    Notiflix.Notify.warning(message);
  }
};
