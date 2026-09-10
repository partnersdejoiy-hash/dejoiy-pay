import zlib
import struct
import math
import os

def create_png(width, height, get_pixel, output_path):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel(x, y, width, height)
            raw_data.extend((r, g, b, a))
    
    compressed = zlib.compress(bytes(raw_data), 9)
    
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        crc = struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        return c + crc

    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_bytes = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr_data) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    with open(output_path, 'wb') as f:
        f.write(png_bytes)
    print(f'Generated {output_path} ({width}x{height}, {len(png_bytes)} bytes)')

def sample_point(nx, ny):
    # Base background: deep slate #0b0f19
    r_bg, g_bg, b_bg = 11, 15, 25

    # Squircle metric: |x|^4 + |y|^4 <= 0.82^4
    s = (nx**4 + ny**4)**0.25
    if s > 0.88:
        # Outside squircle, transparent
        return (0, 0, 0, 0)
    elif s > 0.83:
        # Emerald border #059669
        t = (s - 0.83) / (0.88 - 0.83)
        return (int(5 + (1-t)*11), int(150 + (1-t)*15), int(105 + (1-t)*25), 255)

    # Inside background gradient
    grad = (1.0 - ny) * 0.5
    br = int(11 + grad * 8)
    bg = int(15 + grad * 15)
    bb = int(25 + grad * 30)

    # DejoiY Pay Logo Emblem: Geometric "D" with forward diagonal slash
    # Left vertical stem: x in [-0.42, -0.22], y in [-0.45, 0.45]
    in_stem = (-0.42 <= nx <= -0.22) and (-0.45 <= ny <= 0.45)

    # Outer D curve: (nx - -0.22)^2 + ny^2 <= 0.45^2 and nx >= -0.22
    dx = nx - (-0.22)
    outer_d = (dx >= 0) and (dx**2 + ny**2 <= 0.45**2)
    inner_d = (dx >= 0) and ((dx/0.7)**2 + (ny/0.7)**2 <= 0.25**2)

    # Diagonal payment slash passing through:
    # y = -nx - 0.05, thickness 0.12
    diag_dist = abs(ny + nx * 0.9)
    in_slash = (diag_dist < 0.11) and (-0.35 <= nx <= 0.42) and (-0.4 <= ny <= 0.4)

    if (in_stem or (outer_d and not inner_d)):
        # Emerald to cyan gradient
        em_r = int(16 + (nx + 0.5) * 30)
        em_g = int(185 + (ny + 0.5) * 30)
        em_b = int(129 + (nx + ny + 1.0) * 50)
        em_r = max(0, min(255, em_r))
        em_g = max(0, min(255, em_g))
        em_b = max(0, min(255, em_b))
        return (em_r, em_g, em_b, 255)
    elif in_slash:
        # Crisp white/cyan lightning slash #ffffff
        return (255, 255, 255, 255)

    return (br, bg, bb, 255)

def render(x, y, w, h):
    # 2x2 subpixel anti-aliasing
    subpixels = [
        (-0.25, -0.25),
        (0.25, -0.25),
        (-0.25, 0.25),
        (0.25, 0.25)
    ]
    r_acc, g_acc, b_acc, a_acc = 0, 0, 0, 0
    for sx, sy in subpixels:
        nx = ((x + 0.5 + sx) / w) * 2 - 1
        ny = ((y + 0.5 + sy) / h) * 2 - 1
        r, g, b, a = sample_point(nx, ny)
        r_acc += r
        g_acc += g
        b_acc += b
        a_acc += a
    return (r_acc // 4, g_acc // 4, b_acc // 4, a_acc // 4)

if __name__ == '__main__':
    out_dir = '/root/dejoiy-pay/public'
    create_png(192, 192, render, os.path.join(out_dir, 'icon-192.png'))
    create_png(512, 512, render, os.path.join(out_dir, 'icon-512.png'))
    create_png(180, 180, render, os.path.join(out_dir, 'apple-touch-icon.png'))
    create_png(64, 64, render, os.path.join(out_dir, 'favicon.png'))
