# Run a Bright Discovery

This action runs a new discovery in Bright.

### Build Secure Apps & APIs. Fast.

[Bright](https://www.brightsec.com) is a powerful dynamic application & API security testing (DAST) platform that security teams trust and developers love.

### Automatically Tests Every Aspect of Your Apps & APIs

Scans any target, whether Web Apps, APIs (REST. & SOAP, GraphQL & more), Web sockets or mobile, providing actionable reports

### Seamlessly integrates with the Tools and Workflows You Already Use

Bright works with your existing CI/CD pipelines – trigger scans on every commit, pull request or build with unit testing.

### Spin-Up, Configure and Control Scans with Code

One file. One command. One scan. No UI needed.

### Super-Fast Scans

Interacts with applications and APIs, instead of just crawling them and guessing.
Scans are fast as our AI-powered engine can understand application architecture and generate sophisticated and targeted attacks.

### No False Positives

Stop chasing ghosts and wasting time. Bright doesn’t return false positives, so you can focus on releasing code.

### Comprehensive Security Testing

Bright tests for all common vulnerabilities, such as SQL injection, CSRF, XSS, and XXE -- as well as uncommon vulnerabilities, such as business logic vulnerabilities.

More information is available on Bright’s:

- [Website](https://www.brightsec.com/)
- [Knowledge base](https://docs.brightsec.com/docs/quickstart)
- [YouTube channel](https://www.youtube.com/channel/UCoIC0T1pmozq3eKLsUR2uUw)
- [GitHub Actions](https://github.com/marketplace?query=neuralegion+)

# Inputs

### `name`

**Required**. Discovery name.

_Example:_ `name: GitHub discovery ${{ github.sha }}`

### `api_token`

**Required**. Your Bright API authorization token (key). You can generate it in the **Organization** section in [the Bright app](https://app.neuralegion.com/login). Find more information [here](https://docs.brightsec.com/docs/manage-your-organization#manage-organization-apicli-authentication-tokens).

_Example:_ `api_token: ${{ secrets.NEURALEGION_TOKEN }}`

### `project_id`

Provide project-id for the discovery.

_Example:_ `project_id: gBAh2n9BD9ps7FVQXbLWXv`

### `discovery_types`

**Required**. Array of discovery types. The following types are available:

- `archive` - uses an uploaded HAR-file for a scan
- `crawler` - uses a crawler to define the attack surface for a scan
- `oas` - uses an uploaded OpenAPI schema for a scan <br>
  If no discovery type is specified, `crawler` is applied by default.

_Example:_

```yaml
discovery_types: |
  [ "crawler", "archive" ]
```

### `file_id`

**Required** if the discovery type is set to `archive` or `oas`. ID of a HAR-file or an OpenAPI schema you want to use for a discovery. You can get the ID of an uploaded HAR-file or an OpenAPI schema in the **Storage** section on [app.neuralegion.com](https://app.neuralegion.com/login).

_Example:_

```
FILE_ID=$(nexploit-cli archive:upload   \
--token ${{ secrets.NEURALEGION_TOKEN }}   \
--discard true                          \
./example.har)
```

### `crawler_urls`

**Required** if the discovery type is set to `crawler`. Target URLs to be used by the discovery to define the attack surface.

_Example:_

```yaml
crawler_urls: |
  [ "http://vulnerable-bank.com" ]
```

### `hosts_filter`

**Required** when the the discovery type is set to `archive`. Allows selecting specific hosts for a discovery.

### `exclude_entry_points`

A list of JSON strings that contain patterns for entry points you would like to ignore during the tests.

_Example:_

```yaml
exclude_entry_points: |
  [ { "methods": [ "POST" ], "patterns": [ "users\/.+\/?$" ] } ]
```

To remove default exclusions pass an empty array as follows:

_Example:_

```yaml
exclude_entry_points: |
  []
```

To apply patterns for all HTTP methods, you can set an empty array to `methods`:

```yaml
exclude_entry_points: |
  [ { "methods": [], "patterns": [ "users\/.+\/?$" ] } ]
```

## Outputs

### `url`

Url of the resulting discovery

### `id`

ID of the created discovery.

## Example usage

### Start a new discovery with parameters

```yaml
steps:
  - name: Start Bright Discovery
    id: start
    uses: NeuraLegion/run-scan@v1.1
    with:
      api_token: ${{ secrets.NEURALEGION_TOKEN }}
      name: GitHub discovery ${{ github.sha }}
      discovery_types: |
        [ "crawler", "archive" ]
      crawler_urls: |
        [ "http://vulnerable-bank.com" ]
      file_id: LiYknMYSdbSZbqgMaC9Sj
  - name: Get the output discovery url
    run: echo "The discovery was started on ${{ steps.start.outputs.url }}"
```
