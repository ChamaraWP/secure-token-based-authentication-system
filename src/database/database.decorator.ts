import { Inject } from '@nestjs/common';
import { DATABASE } from './database.constants';

export const InjectDatabase = () => Inject(DATABASE);
