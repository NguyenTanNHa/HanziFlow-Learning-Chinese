import os
import glob

api_dir = r'd:\HanziFlow\src\app\api'
routes = glob.glob(os.path.join(api_dir, '**', 'route.ts'), recursive=True)

marker = "export const dynamic = 'force-dynamic'"
fixed = []
already = []

for path in routes:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'import prisma from' in content and marker not in content:
        new_content = marker + '\n' + content
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        fixed.append(path)
    elif marker in content:
        already.append(path)

print(f'Fixed {len(fixed)} files:')
for f in fixed:
    print(' -', f)
print(f'\nAlready had marker: {len(already)} files')
