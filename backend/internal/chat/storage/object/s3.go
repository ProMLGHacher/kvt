package object

import (
	"context"
	"net/url"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Config struct {
	Endpoint      string
	Region        string
	Bucket        string
	AccessKey     string
	SecretKey     string
	PublicBaseURL string
}

type S3ObjectStorage struct {
	bucket        string
	publicBaseURL string
	client        *s3.Client
	presign       *s3.PresignClient
}

func NewS3ObjectStorage(ctx context.Context, cfg S3Config) (*S3ObjectStorage, error) {
	if cfg.Region == "" {
		cfg.Region = "us-east-1"
	}
	loadOptions := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKey, cfg.SecretKey, "")),
	}
	awsCfg, err := awsconfig.LoadDefaultConfig(ctx, loadOptions...)
	if err != nil {
		return nil, err
	}
	client := s3.NewFromConfig(awsCfg, func(options *s3.Options) {
		if cfg.Endpoint != "" {
			options.BaseEndpoint = aws.String(cfg.Endpoint)
			options.UsePathStyle = true
		}
	})
	return &S3ObjectStorage{
		bucket:        cfg.Bucket,
		publicBaseURL: strings.TrimRight(cfg.PublicBaseURL, "/"),
		client:        client,
		presign:       s3.NewPresignClient(client),
	}, nil
}

func (s *S3ObjectStorage) CreateUploadURL(ctx context.Context, objectKey, contentType string, sizeBytes int64) (string, error) {
	result, err := s.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(objectKey),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(sizeBytes),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return "", err
	}
	return result.URL, nil
}

func (s *S3ObjectStorage) PublicURL(objectKey string) string {
	if s.publicBaseURL != "" {
		return s.publicBaseURL + "/" + escapePath(objectKey)
	}
	return "/" + escapePath(objectKey)
}

func escapePath(path string) string {
	parts := strings.Split(path, "/")
	for index, part := range parts {
		parts[index] = url.PathEscape(part)
	}
	return strings.Join(parts, "/")
}
