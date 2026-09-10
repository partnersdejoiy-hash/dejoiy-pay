export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  const last4 = digits.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export function maskVpa(vpa: string): string {
  if (!vpa || !vpa.includes('@')) return vpa;
  const [user, domain] = vpa.split('@');
  if (user.length <= 3) {
    return `${user.charAt(0)}***@${domain}`;
  }
  const start = user.slice(0, 2);
  return `${start}••••@${domain}`;
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 12) return '••••••••••••';
  const prefix = key.slice(0, 12);
  const suffix = key.slice(-4);
  return `${prefix}${'•'.repeat(16)}${suffix}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user.charAt(0)}*@${domain}`;
  return `${user.charAt(0)}${'*'.repeat(user.length - 2)}${user.slice(-1)}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `+91 ••••• ••${digits.slice(-3)}`;
}
