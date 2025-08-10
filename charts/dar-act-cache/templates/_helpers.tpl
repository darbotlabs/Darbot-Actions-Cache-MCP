{{/*
Expand the name of the chart.
*/}}
{{- define "dar-act-cache.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "dar-act-cache.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "dar-act-cache.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "dar-act-cache.labels" -}}
helm.sh/chart: {{ include "dar-act-cache.chart" . }}
{{ include "dar-act-cache.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "dar-act-cache.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dar-act-cache.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "dar-act-cache.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "dar-act-cache.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
DAR-ACT-Cache environment variables
*/}}
{{- define "dar-act-cache.env" -}}
- name: DAR_ACT_BASE_URL
  value: {{ .Values.darActCache.baseUrl | default (printf "http://%s" (include "dar-act-cache.fullname" .)) | quote }}
- name: DAR_ACT_STORAGE_BACKEND
  value: {{ .Values.darActCache.storage.backend | quote }}
- name: DAR_ACT_DB_TYPE
  value: {{ .Values.darActCache.database.type | quote }}
- name: DAR_ACT_LOG_LEVEL
  value: {{ .Values.darActCache.logging.level | quote }}
- name: DAR_ACT_LOG_FORMAT
  value: {{ .Values.darActCache.logging.format | quote }}
- name: DAR_ACT_CLUSTER_MODE
  value: {{ .Values.darActCache.performance.clusterMode | quote }}
- name: DAR_ACT_WORKERS
  value: {{ .Values.darActCache.performance.workers | quote }}
- name: DAR_ACT_MAX_CACHE_SIZE
  value: {{ .Values.darActCache.performance.maxCacheSize | quote }}
{{- if .Values.darActCache.security.authEnabled }}
- name: DAR_ACT_AUTH_ENABLED
  value: "true"
- name: DAR_ACT_AUTH_TOKEN
  value: {{ .Values.darActCache.security.authToken | quote }}
{{- end }}
{{- end }}

