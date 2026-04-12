import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { username: loginDto.username },
      include: {
        perfil: {
          include: {
            permisos: { include: { permiso: true } },
            nivel: true,
          },
        },
        nivel: true,
        permisos_personalizados: { include: { permiso: true } },
        candidato_superior: {
          include: {
            perfil: { include: { nivel: true } },
            nivel: true,
          },
        },
        campana: true, // <-- NUEVO: Incluimos datos de la campaña
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario y/o contraseña incorrecta');
    }

    if (!usuario.estado) {
      throw new UnauthorizedException(
        'Tu cuenta está temporalmente deshabilitada. Contactá al administrador.',
      );
    }

    const passwordValido = await bcrypt.compare(loginDto.password, usuario.password);

    if (!passwordValido) {
      throw new UnauthorizedException('Usuario y/o contraseña incorrecta');
    }

    const tokens = await this.generarTokens(usuario.id);
    await this.actualizarRefreshToken(usuario.id, tokens.refresh_token);

    const { password, refresh_token, ...usuarioSinPassword } = usuario;

    const esOperativo = usuario.perfil.es_operativo;

    const nivelEfectivo =
      esOperativo && usuario.candidato_superior ? usuario.candidato_superior.nivel : usuario.nivel;

    return {
      message: 'Inicio de sesión exitoso',
      usuario: {
        ...usuarioSinPassword,
        nivel: nivelEfectivo,
        es_operativo: esOperativo,
      },
      ...tokens,
    };
  }

  async registro(registroDto: RegistroDto, usuarioActualId: string) {
    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          {
            username: `${registroDto.nombre.toLowerCase()}.${registroDto.apellido.toLowerCase()}`,
          },
          { documento: registroDto.documento },
        ],
      },
    });

    if (usuarioExistente) {
      throw new ConflictException('Usuario o documento ya existe');
    }

    const perfil = await this.prisma.perfil.findUnique({
      where: { id: registroDto.perfil_id },
      include: { nivel: true },
    });

    if (!perfil) {
      throw new ConflictException('Perfil no existe');
    }

    const passwordHash = await bcrypt.hash(registroDto.password, 10);
    const username = `${registroDto.nombre.toLowerCase()}.${registroDto.apellido.toLowerCase()}`;

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre: registroDto.nombre,
        apellido: registroDto.apellido,
        username,
        documento: registroDto.documento,
        telefono: registroDto.telefono,
        password: passwordHash,
        perfil_id: registroDto.perfil_id,
        nivel_id: perfil.nivel_id ?? null,
        candidato_superior_id: registroDto.candidato_superior_id,
        creado_por_id: usuarioActualId,
      },
      include: {
        perfil: { include: { nivel: true } },
        nivel: true,
      },
    });

    const { password, refresh_token, ...usuarioSinPassword } = nuevoUsuario;
    return usuarioSinPassword;
  }

  async refresh(usuarioId: string) {
    const tokens = await this.generarTokens(usuarioId);
    await this.actualizarRefreshToken(usuarioId, tokens.refresh_token);

    return tokens;
  }

  async logout(usuarioId: string) {
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { refresh_token: null },
    });

    return { mensaje: 'Logout exitoso' };
  }

  private async generarTokens(usuarioId: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { sub: usuarioId },
        {
          secret: this.configService.get<string>('jwt.secret'),
          expiresIn: this.configService.get<string>('jwt.expiresIn'),
        },
      ),
      this.jwtService.signAsync(
        { sub: usuarioId },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  private async actualizarRefreshToken(usuarioId: string, refreshToken: string) {
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { refresh_token: refreshToken },
    });
  }
}
