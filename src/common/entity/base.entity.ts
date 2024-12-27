import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseModel {
  // @PrimaryColumn() : 기본 키 직접 지정
  // @PrimaryGeneratedColumn() : 자동 생성
  // @PrimaryGeneratedColumn({ type: 'uuid' }) : UUID 생성
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
