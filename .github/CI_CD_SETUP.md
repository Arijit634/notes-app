# CI/CD Deployment

This repository deploys automatically from GitHub Actions when `main` is updated.

## Production Targets

- Frontend: S3 bucket `notes-frontend-20260528-1905`
- Frontend CDN: CloudFront distribution `E186OZUPMQVPEZ`
- Backend: Elastic Beanstalk application `notes-app`
- Backend environment: `notes-backend-env`
- AWS region: `eu-north-1`

## Security Model

GitHub Actions uses AWS OIDC to assume:

```text
arn:aws:iam::623210504048:role/notes-app-github-actions-deploy-role
```

No long-lived AWS access keys are stored in GitHub.

## Pipeline Flow

1. Build the Spring Boot backend with Java 21.
2. Build the Vite frontend with Node 22.
3. Package the backend jar and `Procfile` for Elastic Beanstalk.
4. Upload the backend bundle to the Elastic Beanstalk S3 bucket.
5. Create a new Elastic Beanstalk application version.
6. Update the production Elastic Beanstalk environment.
7. Sync the frontend `dist` folder to S3.
8. Invalidate the frontend CloudFront cache.
9. Run basic smoke checks against the frontend and backend URLs.

## Current Gates

The workflow blocks deployment on successful backend and frontend production builds.
The existing frontend lint command and backend test suite are not yet reliable enough
to use as blocking gates; hardening those checks is the next CI maturity step.
