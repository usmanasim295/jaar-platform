import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateServiceDto } from './dto/update-service.dto';
import { TranslationService } from '../common/services/translation.service';
import { MessageService } from '../common/services/message.service';

@Injectable()
export class ServiceService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private messageService: MessageService,
  ) {}

  async seedServices() {
    const services = [
      {
        name: 'AC Services',
        description:
          'Air conditioning installation, repair, and maintenance services',
        image: null,
        serviceQuestions: [
          {
            question: 'What is the type of AC you need?',
          },
          {
            question: 'What is the brand of AC you need?',
          },
          {
            question: 'What is the model of AC you need?',
          },
        ],
      },
      {
        name: 'Cleaning Services',
        description:
          'House cleaning, office cleaning, and specialized cleaning services',
        image: null,
        serviceQuestions: [
          {
            question: 'What is the type of cleaning you need?',
          },
          {
            question: 'What is the frequency of cleaning you need?',
          },
        ],
      },
      {
        name: 'Electrician',
        description:
          'Electrical installation, repair, and maintenance services',
        image: null,
        serviceQuestions: [
          {
            question: 'What is the type of electrical work you need?',
          },
          {
            question: 'What is the frequency of electrical work you need?',
          },
        ],
      },
      {
        name: 'Plumber',
        description: 'Plumbing installation, repair, and maintenance services',
        image: null,
        serviceQuestions: [
          {
            question: 'What is the type of plumbing work you need?',
          },
          {
            question: 'What is the frequency of plumbing work you need?',
          },
        ],
      },
      {
        name: 'Painter',
        description: 'Interior and exterior painting services',
        image: null,
        serviceQuestions: [
          {
            question: 'What is the type of painting you need?',
          },
          {
            question: 'What is the frequency of painting you need?',
          },
        ],
      },
      {
        name: 'Pest Control',
        description: 'Pest elimination and prevention services',
        image: null,
        serviceQuestions: [
          {
            question: 'What is the type of pest control you need?',
          },
          {
            question: 'What is the frequency of pest control you need?',
          },
        ],
      },
    ];

    for (const service of services) {
      // Translate service name and description
      const [nameTranslations, descriptionTranslations] = await Promise.all([
        this.translationService.createTranslationObject(service.name),
        this.translationService.createTranslationObject(service.description),
      ]);
      const serviceQuestions = await Promise.all(
        service.serviceQuestions.map((question) =>
          this.translationService.createTranslationObject(question.question),
        ),
      );

      // Check if service already exists by checking if any service has the same English name
      const existingService = await this.prisma.service.findFirst({
        where: {
          name: {
            path: ['en'],
            equals: service.name,
          },
        },
      });

      if (!existingService) {
        await this.prisma.service.create({
          data: {
            name: nameTranslations,
            description: descriptionTranslations,
            image: service.image,
            serviceQuestions: {
              create: serviceQuestions.map((question) => ({
                question: question,
              })),
            },
          },
        });
      } else {
        for (let i = 0; i < service.serviceQuestions.length; i++) {
          const seedQuestionText = service.serviceQuestions[i].question;
          const translatedQuestion = serviceQuestions[i];

          const existingQuestion = await this.prisma.serviceQuestion.findFirst({
            where: {
              serviceId: existingService.id,
              question: {
                path: ['en'],
                equals: seedQuestionText,
              },
            },
          });

          if (!existingQuestion) {
            await this.prisma.serviceQuestion.create({
              data: {
                serviceId: existingService.id,
                question: translatedQuestion,
              },
            });
          }
        }
      }
    }
    return {
      message: this.messageService.getSuccessMessage('service.seeded', 'en'),
    };
  }

  async getAvailableServices() {
    const services = await this.prisma.service.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        serviceQuestions: {
          select: {
            id: true,
            question: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return services;
  }

  findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
