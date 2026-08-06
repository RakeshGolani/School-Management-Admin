'use client';

import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const FormPhoneInput = ({ label, value, onChange, error, required, defaultCountry = 'in' }) => {
    // Ensure 10-digit Indian numbers default to +91
    const formatInputValue = (val) => {
        if (!val) return '';
        const clean = val.toString().trim();
        if (clean.startsWith('+')) return clean;
        if (/^\d{10}$/.test(clean)) return `+91 ${clean}`;
        if (/^91\d{10}$/.test(clean)) return `+${clean}`;
        return clean;
    };

    const formattedValue = formatInputValue(value);

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {label} {required && <span className="text-amber-500">*</span>}
                </label>
            )}
            <PhoneInput
                defaultCountry={defaultCountry}
                preferredCountries={['in', 'us', 'gb', 'ae']}
                value={formattedValue}
                forceDialCode
                charAfterDialCode=" "
                prefix="+"
                onChange={(phone) => {
                    onChange(phone);
                }}
                className='w-full'
                inputStyle={{
                    width: '100%',
                    height: '42px', // Match standard Input height
                    fontSize: '14px',
                    borderRadius: '0 12px 12px 0',
                    border: error ? '1px solid #f43f5e' : '1px solid var(--slate-700)',
                    borderLeft: 'none',
                    color: 'var(--slate-100)',
                    backgroundColor: 'var(--slate-800)',
                    paddingLeft: '12px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                }}
                countrySelectorStyleProps={{
                    buttonStyle: {
                        height: '42px', // Match standard Input height
                        borderRadius: '12px 0 0 12px',
                        border: error ? '1px solid #f43f5e' : '1px solid var(--slate-700)',
                        borderRight: 'none',
                        backgroundColor: 'var(--slate-800)',
                        padding: '0 10px',
                        transition: 'all 0.2s ease'
                    },
                    dropdownStyleProps: {
                        style: {
                            backgroundColor: 'var(--slate-900)',
                            color: 'var(--slate-100)',
                            border: '1px solid var(--slate-800)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                            scrollbarWidth: 'thin'
                        }
                    }
                }}
            />
            {error && <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>}
        </div>
    );
};

export default FormPhoneInput;
