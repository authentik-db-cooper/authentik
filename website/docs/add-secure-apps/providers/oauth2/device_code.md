# Device code flow

(Also known as device flow and [RFC 8628](https://datatracker.ietf.org/doc/html/rfc8628))

This type of authentication flow is useful for devices with limited input abilities and/or devices without browsers.

### Requirements

This device flow is only possible if the active brand has a device code flow setup. This device code flow is run _after_ the user logs in, and before the user authenticates.

authentik doesn't ship with a default flow for this usecase, so it is recommended to create a new flow for this usecase with the designation of _Stage configuration_

### Device-side

The flow is initiated by sending a POST request to the device authorization endpoint, `/application/o/device/` with the following contents:

```http
POST /application/o/device/ HTTP/1.1
Host: authentik.company
Content-Type: application/x-www-form-urlencoded

client_id=application_client_id&
scope=openid email my-other-scope
```

The response contains the following fields:

- `device_code`: Device code, which is the code kept on the device
- `verification_uri`: The URL to be shown to the enduser to input the code
- `verification_uri_complete`: The same URL as above except the code will be prefilled
- `user_code`: The raw code for the enduser to input
- `expires_in`: The total seconds after which this token will expire
- `interval`: The interval in seconds for how often the device should check the token status

---

With this response, the device can start checking the status of the token by sending requests to the token endpoint like this:

```http
POST /application/o/token/ HTTP/1.1
Host: authentik.company
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:device_code&
client_id=application_client_id&
device_code=device_code_from_above
```

If the user has not opened the link above yet, or has not finished the authentication and authorization yet, the response will contain an `error` element set to `authorization_pending`. The device should re-send the request in the interval set above.

If the user _has_ finished the authentication and authorization, the response will be similar to any other generic OAuth2 Token request, containing `access_token` and `id_token`.

### Creating and applying a device code flow

1. Log in to authentik as an admin, and open the authentik Admin interface.
2. Navigate to **Flows and Stages** > **Flows** and click **Create**.
3. Set the following required configurations:
    - **Name**: provide a name (e.g. `default-device-code-flow`)
    - **Title**: provide a title (e.g. `Device code flow`)
    - **Slug**: provide a slug (e.g `default-device-code-flow`)
    - **Designation**: `Stage Configuration`
    - **Authentication**: `Require authentication`
4. Click **Create**.
5. Navigate to **System** > **Brands** and click the **Edit** icon on the default brand.
6. Set **Default code flow** to the newly created device code flow and click **Update**.
