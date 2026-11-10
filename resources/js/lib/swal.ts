import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

/**
 * Konfigurasi kustom SweetAlert2 dengan tema & font Kelana.
 */
export const kelanaSwal = Swal.mixin({
    customClass: {
        popup: 'rounded-3xl font-sans p-6 border border-[#E2E8F0] shadow-2xl',
        title: 'text-lg font-bold text-[#0F172A]',
        htmlContainer: 'text-xs text-[#64748B] leading-relaxed',
        confirmButton: 'px-5 py-2.5 bg-[#3152A3] hover:bg-[#284389] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer mx-1.5',
        cancelButton: 'px-5 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold rounded-xl transition cursor-pointer mx-1.5',
    },
    buttonsStyling: false,
});

/**
 * Menampilkan peringatan (Warning) SweetAlert.
 */
export function showWarningAlert(title: string, message?: string) {
    return kelanaSwal.fire({
        icon: 'warning',
        title,
        text: message,
        confirmButtonText: 'Mengerti',
    });
}

/**
 * Menampilkan error SweetAlert.
 */
export function showErrorAlert(title: string, message?: string) {
    return kelanaSwal.fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonText: 'Tutup',
    });
}

/**
 * Menampilkan sukses SweetAlert.
 */
export function showSuccessAlert(title: string, message?: string) {
    return kelanaSwal.fire({
        icon: 'success',
        title,
        text: message,
        confirmButtonText: 'Lanjutkan',
    });
}

export default kelanaSwal;
