package application

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type RMSAdminClient struct {
	baseURL string
	apiKey  string
	client  *http.Client
}

func NewRMSAdminClient(baseURL, apiKey string) *RMSAdminClient {
	return &RMSAdminClient{
		baseURL: strings.TrimRight(baseURL, "/"),
		apiKey:  apiKey,
		client:  http.DefaultClient,
	}
}

func (c *RMSAdminClient) CreateRoom(ctx context.Context, roomID string) error {
	var response struct {
		RealtimeRoomID string `json:"realtimeRoomId"`
	}
	return c.do(ctx, http.MethodPost, "/admin/v1/rooms", map[string]string{"roomId": roomID}, &response)
}

func (c *RMSAdminClient) CreateSession(ctx context.Context, roomID string, prefs PrejoinPreferences) (JoinResult, error) {
	var result JoinResult
	if err := c.do(ctx, http.MethodPost, "/admin/v1/rooms/"+roomID+"/sessions", prefs, &result); err != nil {
		return JoinResult{}, err
	}
	return result, nil
}

func (c *RMSAdminClient) GetRoom(ctx context.Context, roomID string) (RoomMetadata, error) {
	var result RoomMetadata
	if err := c.do(ctx, http.MethodGet, "/admin/v1/rooms/"+roomID, nil, &result); err != nil {
		return RoomMetadata{}, err
	}
	return result, nil
}

func (c *RMSAdminClient) do(ctx context.Context, method, path string, body any, out any) error {
	var payload *bytes.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return err
		}
		payload = bytes.NewReader(data)
	} else {
		payload = bytes.NewReader(nil)
	}

	request, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, payload)
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-RMS-Admin-Key", c.apiKey)

	response, err := c.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("rms admin request failed: %s", response.Status)
	}

	if out == nil {
		return nil
	}
	return json.NewDecoder(response.Body).Decode(out)
}
