import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
    let service: UsersRepository;
    let prisma: PrismaService;

    const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersRepository,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findMany: jest.fn().mockResolvedValue(mockUsers),
                            findUnique: jest.fn().mockImplementation((params) => {
                                const user = mockUsers.find(u => u.id === params.where.id);
                                return Promise.resolve(user);
                            }),
                        },
                    },
                },
            ],
        }).compile()

        service = module.get<UsersRepository>(UsersRepository);
        prisma = module.get<PrismaService>(PrismaService);
    })

    it('defined', () => {
        expect(service).toBeDefined()
    })

    describe('findAll', () => {
        it('Должен вывести всех юзеров', async () => {
            const result = await service.findAll()

            expect(result).toEqual(mockUsers)
            expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
        })
    })

    describe('findOne', () => {
    it('должен вывести одного юзера по id', async () => {
      
      const userId = 1;
      
      
      const result = await service.findOne(userId);
      
      
      expect(result).toEqual(mockUsers[0]);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('должен вернуть undefined если юзер не найден', async () => {
      
      const userId = 500; 
      
      
      const result = await service.findOne(userId);
      
      
      expect(result).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });




})

