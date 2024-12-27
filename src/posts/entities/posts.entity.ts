import { UsersModel } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity()
export class PostsModel {
  // @PrimaryColumn() : 기본 키 직접 지정
  // @PrimaryGeneratedColumn() : 자동 생성
  // @PrimaryGeneratedColumn({ type: 'uuid' }) : UUID 생성
  @PrimaryGeneratedColumn()
  id: number;

  /* *** Column 프로퍼티 설명 ***
  @Column({
    type: 'text',           // 데이터베이스 컬럼 타입 (기본값: 프로퍼티 타입으로 자동 유추)
    name: '_author',        // 컬럼명 (기본값: 프로퍼티명으로 자동 유추)
    length: 100,            // 값의 길이
    default: 'anonymous',   // 기본값
    nullable: true,         // Null 허용 여부
    update: true,           // false일 경우, 최초 저장 시에만 값을 설정할 수 있음
    unique: true,           // 데이터베이스 컬럼 유니크 여부 지정
    select: true,           // 쿼리 결과에 포함되는지 여부
  })
    */

  @ManyToOne(() => UsersModel, (user) => user.posts, { nullable: false })
  author: UsersModel;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  // 생성 일시 자동 생성
  @CreateDateColumn()
  createdAt: Date;

  // 수정 일시 자동 생성
  @UpdateDateColumn()
  updatedAt: Date;

  // save() 함수가 호출될 때마다 1씩 증가 (즉, 최초 저장 시 1)
  @VersionColumn()
  version: number;

  // 순차적인 번호 부여가 필요하나, 기본 키로 사용하고 싶지 않을 경우 사용
  // ex. 게시물 번호, 주문 번호
  @Column()
  @Generated('increment')
  additionalId: number;
}

/* 테이블 재사용 방법 3가지

- Entity Embedding: 주소 정보(Address)처럼 여러 엔티티에서 공통으로 사용되는 필드 그룹
- Table Inheritance: 회원 시스템에서 일반회원(User)과 관리자(Admin)처럼 완전히 다른 속성과 권한이 필요한 경우
- Single Table Inheritance: 게시글 시스템에서 일반글, 공지사항, 이벤트 글처럼 기본 구조는 비슷하지만 약간의 추가 필드가 있는 경우



/// Entity Embedding 방식

export class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class StudentModel {
  @Column(() => BaseModel)
  base: BaseModel;

  @Column()
  name: string;
}

@Entity()
export class TeacherModel {
  @Column(() => BaseModel)
  base: BaseModel;

  @Column()
  name: string;
}



/// Table Inheritance 방식

export class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class StudentModel extends BaseModel {
  @Column()
  name: string;
}

@Entity()
export class TeacherModel extends BaseModel {
  @Column()
  name: string;
}



/// Single Table Inheritance 방식

@Entity()
@TableInheritance({
  column: {
    name: 'type',
    type: 'varchar',
  },
})
export class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ChildEntity()
export class StudentModel extends BaseModel {
  @Column()
  name: string;
}

@ChildEntity()
export class TeacherModel extends BaseModel {
  @Column()
  name: string;
}

  */