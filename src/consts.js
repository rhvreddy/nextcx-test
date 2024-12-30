export const emailRegex = /^[\w-\.]+@([a-z-]+\.)+[\w-]{2,4}$/
export const validImageTypes = ['image/jpeg', 'image/png'];

export const mainAppName = window.location.href.toLowerCase().includes('SIA'.toLowerCase()) || window.location.hostname === 'localhost' ? "SIA" : "NextCX";
