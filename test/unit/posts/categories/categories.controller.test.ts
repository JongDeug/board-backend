import { CategoriesController } from '../../../../src/domain/posts/categories/categories.controller';
import { CategoriesService } from '../../../../src/domain/posts/categories/categories.service';
import { NextFunction, Request, Response } from 'express';
import httpMocks from 'node-mocks-http';
import { User } from '@prisma';
import { CustomError } from '@utils/customError';
import { PostsService } from '../../../../src/domain/posts/posts.service';
import { prismaMock } from '../../../singleton';

jest.mock('../../../../src/domain/posts/categories/categories.service');

describe('CategoriesController', () => {
    let req: httpMocks.MockRequest<Request>;
    let res: httpMocks.MockResponse<Response>;
    let next: NextFunction;
    let categoriesController: CategoriesController;
    let categoriesServiceMock: jest.Mocked<CategoriesService>;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
        categoriesServiceMock = jest.mocked(new CategoriesService()) as jest.Mocked<CategoriesService>;
        categoriesController = new CategoriesController(categoriesServiceMock);
    });

    // --- CreateCategory
    describe('createCategory', () => {
        beforeEach(() => {
            req.user = { id: 'mockUserId' } as User;
            req.body = {
                name: '새로운 카테고리',
            };
        });

        test('should create a category successfully', async () => {
            // when
            await categoriesController.createCategory(req, res, next);
            // then
            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toStrictEqual({});
            expect(res._isEndCalled()).toBeTruthy();
            expect(categoriesServiceMock.createCategory).toHaveBeenCalledWith(req.body);
        });

        test('should handle error if user is not authenticated', async () => {
            // given
            req.user = undefined;
            // when
            await categoriesController.createCategory(req, res, next);
            // then
            expect(next).toHaveBeenCalledWith(new CustomError(401, 'Unauthorized', '로그인을 진행해주세요'));
            expect(categoriesServiceMock.createCategory).not.toHaveBeenCalled();
        });

        test('should handle error if categoriesServiceMock.createCategory throws error', async () => {
            // given
            categoriesServiceMock.createCategory.mockRejectedValue(new Error('데이터베이스: 카테고리 생성 오류'));
            // when
            await categoriesController.createCategory(req, res, next);
            // then
            expect(next).toHaveBeenCalledWith(new Error('데이터베이스: 카테고리 생성 오류'));
        });
    });
    // ---

    // --- UpdateCategory
    describe('updateCategory', () => {
        beforeEach(() => {
            req.user = { id: 'mockUserId' } as User;
            req.params.name = 'targetCategory';
            req.body = {
                name: 'newCategory',
            };
        });

        test('should update a category successfully', async () => {
            // when
            await categoriesController.updateCategory(req, res, next);
            // then
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toStrictEqual({});
            expect(res._isEndCalled()).toBeTruthy();
            expect(categoriesServiceMock.updateCategory).toHaveBeenCalledWith(req.params.name, req.body);
        });

        test('should handle error if user is not authenticated', async () => {
            // given
            req.user = undefined;
            // when
            await categoriesController.updateCategory(req, res, next);
            // then
            expect(next).toHaveBeenCalledWith(new CustomError(401, 'Unauthorized', '로그인을 진행해주세요'));
            expect(categoriesServiceMock.updateCategory).not.toHaveBeenCalled();
        });

        test('should handle error if categoriesServiceMock.updateCategory throws error', async () => {
            // given
            categoriesServiceMock.updateCategory.mockRejectedValue(new Error('데이터베이스: 카테고리 수정 오류'));
            // when
            await categoriesController.updateCategory(req, res, next);
            // then
            expect(next).toHaveBeenCalledWith(new Error('데이터베이스: 카테고리 수정 오류'));
        });

    });
    // ---
});
