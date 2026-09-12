import swaggerUi from 'swagger-ui-express'

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Luma.Study API Documentation',
    version: '1.0.0',
    description: 'Lecture material vault and AI study companion backend API.',
    contact: {
      name: 'Luma.Study Team'
    }
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your short-lived Bearer Access Token in the Authorization header.'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object', nullable: true }
        }
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'UNAUTHORIZED' },
              message: { type: 'string', example: 'Invalid or expired token' },
              details: { type: 'object', nullable: true }
            }
          }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'SuperSecr3t!' }
        }
      },
      VerifyEmailInput: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          code: { type: 'string', minLength: 6, maxLength: 6, example: '482910' }
        }
      },
      ResendVerificationInput: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', format: 'password', example: 'SuperSecr3t!' }
        }
      },
      ForgotPasswordInput: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' }
        }
      },
      ResetPasswordInput: {
        type: 'object',
        required: ['email', 'code', 'newPassword'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          code: { type: 'string', minLength: 6, maxLength: 6, example: '850192' },
          newPassword: { type: 'string', format: 'password', minLength: 8, example: 'BrandNewSecr3t!' }
        }
      },
      UserProfileCompleteInput: {
        type: 'object',
        required: ['level', 'department', 'university', 'lectureTimeTable', 'courseTitles', 'creditUnits', 'currentSemester'],
        properties: {
          level: { type: 'integer', example: 300 },
          department: { type: 'string', example: 'Computer Science' },
          faculty: { type: 'string', example: 'Science' },
          university: { type: 'string', example: 'Harvard University' },
          academicSession: { type: 'string', example: '2024/2025' },
          timezone: { type: 'string', example: 'UTC' },
          learningMode: { type: 'string', example: 'Standard', enum: ['Standard', 'Strict', 'Exam Prep', 'Concept Understanding', 'Summary Only'] },
          lectureTimeTable: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'string', example: 'Monday' },
                courseCodes: { type: 'array', items: { type: 'string' }, example: ['CSC101', 'MAT101'] }
              }
            }
          },
          courseTitles: { type: 'array', items: { type: 'string' }, example: ['Introduction to CS', 'Calculus I'] },
          creditUnits: { type: 'integer', example: 3 },
          currentSemester: { type: 'string', example: 'First', enum: ['First', 'Second'] }
        }
      },
      RefreshTokenInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        description: 'Checks backend service uptime and health status.',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Server is healthy',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register New User',
        description: 'Creates a new local user account and enqueues a 6-digit OTP email verification code.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } }
        },
        responses: {
          201: { description: 'Registration successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
          409: { description: 'Email conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } }
        }
      }
    },
    '/api/auth/verify-email': {
      post: {
        summary: 'Verify Email Address',
        description: 'Verifies user email address using the 6-digit OTP code and returns access/refresh JWT tokens.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyEmailInput' } } }
        },
        responses: {
          200: { description: 'Email verified successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          400: { description: 'Invalid or expired verification code', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } }
        }
      }
    },
    '/api/auth/resend-verification': {
      post: {
        summary: 'Resend Email Verification Code',
        description: 'Generates and emails a new 6-digit OTP verification code.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResendVerificationInput' } } }
        },
        responses: {
          200: { description: 'Verification code resent', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'User Login',
        description: 'Authenticates email & password credentials and returns dual JWT access and refresh tokens.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } }
        },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
          403: { description: 'Email unverified', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } }
        }
      }
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Request Password Reset',
        description: 'Sends a 6-digit password reset OTP code to the registered email address.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordInput' } } }
        },
        responses: {
          200: { description: 'Password reset instructions sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset Password',
        description: 'Resets user password using the 6-digit reset OTP code.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordInput' } } }
        },
        responses: {
          200: { description: 'Password reset successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          400: { description: 'Invalid or expired reset code', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } }
        }
      }
    },
    '/api/auth/google': {
      get: {
        summary: 'Initiate Google OAuth Sign-In',
        tags: ['Auth'],
        responses: { 302: { description: 'Redirect to Google Authentication' } }
      }
    },
    '/api/auth/google/callback': {
      get: {
        summary: 'Google OAuth Callback',
        tags: ['Auth'],
        responses: {
          200: { description: 'User authenticated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh Access Token',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenInput' } } }
        },
        responses: {
          200: { description: 'Access token refreshed successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout / Revoke Session',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Token successfully revoked', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/user/profile': {
      get: {
        summary: 'Fetch User Profile',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/user/profile/complete': {
      post: {
        summary: 'Complete User Profile',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfileCompleteInput' } } }
        },
        responses: {
          200: { description: 'Profile completed successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/course/enrolledCourses': {
      get: {
        summary: 'List Enrolled Courses',
        tags: ['Course'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Enrolled courses retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    },
    '/api/course/enrolledCourses/{id}': {
      get: {
        summary: 'Fetch Enrolled Course Details',
        tags: ['Course'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Enrolled course retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
        }
      }
    }
  }
}

export { swaggerUi, swaggerSpec }
