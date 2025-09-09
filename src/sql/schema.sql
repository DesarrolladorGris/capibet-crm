-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actividades (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  titulo character varying NOT NULL,
  descripcion text,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['llamada'::character varying, 'reunion'::character varying, 'tarea'::character varying]::text[])),
  fecha timestamp without time zone,
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'en_progreso'::character varying, 'completado'::character varying]::text[])),
  contacto_id bigint,
  deal_id bigint,
  asignado_a bigint NOT NULL,
  creado_por bigint NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT actividades_pkey PRIMARY KEY (id),
  CONSTRAINT actividades_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id),
  CONSTRAINT actividades_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT actividades_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES public.usuarios(id),
  CONSTRAINT actividades_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id)
);
CREATE TABLE public.auditoria (
  id bigint NOT NULL DEFAULT nextval('auditoria_id_seq'::regclass),
  entidad character varying NOT NULL,
  entidad_id bigint NOT NULL,
  accion character varying NOT NULL,
  datos_previos jsonb,
  datos_nuevos jsonb,
  actor_id bigint,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT auditoria_pkey PRIMARY KEY (id),
  CONSTRAINT auditoria_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.automatizaciones (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  owner_id bigint NOT NULL,
  trigger_event character varying NOT NULL,
  condiciones jsonb NOT NULL DEFAULT '{}'::jsonb,
  acciones jsonb NOT NULL DEFAULT '[]'::jsonb,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT automatizaciones_pkey PRIMARY KEY (id),
  CONSTRAINT automatizaciones_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.canales (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  espacio_id bigint,
  tipo text,
  descripcion text,
  creado_en timestamp without time zone DEFAULT now(),
  actualizado_en timestamp without time zone DEFAULT now(),
  creado_por bigint,
  CONSTRAINT canales_pkey PRIMARY KEY (id),
  CONSTRAINT canales_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT canales_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES public.espacios_de_trabajo(id)
);
CREATE TABLE public.contactos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying,
  apellido character varying,
  nombre_completo character varying,
  correo character varying UNIQUE,
  telefono character varying,
  empresa character varying,
  cargo character varying,
  notas text,
  direccion text,
  cumpleaños date,
  sitio_web character varying,
  etiqueta character varying,
  creado_por bigint NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  empresa_id bigint,
  CONSTRAINT contactos_pkey PRIMARY KEY (id),
  CONSTRAINT contactos_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id),
  CONSTRAINT contactos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.deals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  contacto_id bigint NOT NULL,
  embudo_id bigint NOT NULL,
  etapa_id bigint NOT NULL,
  valor numeric,
  descripcion text,
  owner_id bigint NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT deals_pkey PRIMARY KEY (id),
  CONSTRAINT deals_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id),
  CONSTRAINT deals_embudo_id_fkey FOREIGN KEY (embudo_id) REFERENCES public.embudos(id),
  CONSTRAINT deals_etapa_id_fkey FOREIGN KEY (etapa_id) REFERENCES public.etapas_embudo(id),
  CONSTRAINT deals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.embudos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  creado_por bigint NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  espacio_id bigint NOT NULL,
  orden bigint,
  CONSTRAINT embudos_pkey PRIMARY KEY (id),
  CONSTRAINT embudos_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id),
  CONSTRAINT embudos_espacio_id_fkey FOREIGN KEY (espacio_id) REFERENCES public.espacios_de_trabajo(id)
);
CREATE TABLE public.empresas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  rubro character varying,
  website character varying,
  owner_id bigint NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT empresas_pkey PRIMARY KEY (id),
  CONSTRAINT empresas_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.espacios_de_trabajo (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying,
  creado_por bigint NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT espacios_de_trabajo_pkey PRIMARY KEY (id),
  CONSTRAINT espacios_de_trabajo_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id)
);
CREATE TABLE public.etapas_embudo (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  embudo_id bigint NOT NULL,
  nombre character varying NOT NULL,
  orden integer NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT etapas_embudo_pkey PRIMARY KEY (id),
  CONSTRAINT etapas_embudo_embudo_id_fkey FOREIGN KEY (embudo_id) REFERENCES public.embudos(id)
);
CREATE TABLE public.mensajes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  canal_id bigint NOT NULL,
  remitente_id bigint NOT NULL,
  contenido character varying NOT NULL,
  contacto_id bigint,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  sesion_id bigint,
  destinatario_id bigint NOT NULL,
  embudo_id bigint NOT NULL,
  CONSTRAINT mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT mensajes_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.contactos(id),
  CONSTRAINT mensajes_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES public.sesiones(id),
  CONSTRAINT mensajes_embudo_id_fkey FOREIGN KEY (embudo_id) REFERENCES public.embudos(id),
  CONSTRAINT mensajes_remitente_id_fkey FOREIGN KEY (remitente_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.plantillas_mensajes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  canal character varying CHECK (canal::text = ANY (ARRAY['whatsapp'::character varying, 'facebook'::character varying, 'instagram'::character varying, 'email'::character varying, 'webchat'::character varying]::text[])),
  contenido text NOT NULL,
  creado_por bigint NOT NULL,
  creado_en timestamp without time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT plantillas_mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT plantillas_mensajes_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id)
);
CREATE TABLE public.respuestas_rapidas (
  id integer NOT NULL DEFAULT nextval('respuestas_rapidas_id_seq'::regclass),
  titulo character varying NOT NULL,
  contenido text NOT NULL,
  categoria character varying NOT NULL,
  activa boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  creado_por bigint,
  CONSTRAINT respuestas_rapidas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sesiones (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  canal_id bigint NOT NULL,
  usuario_id bigint NOT NULL,
  nombre character varying NOT NULL,
  api_key text,
  access_token text,
  phone_number text,
  email_user text,
  email_password text,
  smtp_host text,
  smtp_port integer,
  imap_host text,
  imap_port integer,
  estado character varying NOT NULL DEFAULT 'activo'::character varying CHECK (estado::text = ANY (ARRAY['activo'::character varying, 'desconectado'::character varying, 'expirado'::character varying]::text[])),
  creado_en timestamp without time zone DEFAULT now(),
  actualizado_en timestamp without time zone DEFAULT now(),
  creado_por bigint,
  CONSTRAINT sesiones_pkey PRIMARY KEY (id),
  CONSTRAINT sesiones_canal_id_fkey FOREIGN KEY (canal_id) REFERENCES public.canales(id),
  CONSTRAINT sesiones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.usuarios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_agencia character varying NOT NULL,
  tipo_empresa character varying NOT NULL,
  nombre_usuario character varying NOT NULL,
  correo_electronico character varying NOT NULL,
  telefono character varying NOT NULL,
  codigo_pais character varying NOT NULL,
  contrasena character varying NOT NULL,
  fecha_alta date NOT NULL DEFAULT now(),
  rol character varying NOT NULL,
  activo boolean NOT NULL,
  creado_por bigint,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);