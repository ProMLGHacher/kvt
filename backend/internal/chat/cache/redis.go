package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache(redisURL string) (*RedisCache, error) {
	options, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}
	return &RedisCache{client: redis.NewClient(options)}, nil
}

func (c *RedisCache) Close() error {
	return c.client.Close()
}

func (c *RedisCache) SetPresence(ctx context.Context, spaceID, participantID string) {
	_ = c.client.Set(ctx, "chat:presence:"+spaceID+":"+participantID, "online", 45*time.Second).Err()
}

func (c *RedisCache) ClearPresence(ctx context.Context, spaceID, participantID string) {
	_ = c.client.Del(ctx, "chat:presence:"+spaceID+":"+participantID).Err()
}

func (c *RedisCache) Allow(ctx context.Context, key string, limit int, window time.Duration) bool {
	count, err := c.client.Incr(ctx, "chat:rl:"+key).Result()
	if err != nil {
		return true
	}
	if count == 1 {
		_ = c.client.Expire(ctx, "chat:rl:"+key, window).Err()
	}
	return count <= int64(limit)
}
