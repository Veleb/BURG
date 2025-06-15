import { createHash } from 'crypto';

export default function generateChecksum(payload: string, key: string): string {
  return createHash('sha256').update(payload + '/pg/v1/pay' + key).digest('hex') + '###1';
}
