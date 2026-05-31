import json
import sys

log_path = r'C:\Users\Admin\.gemini\antigravity\brain\416d301a-902b-417f-8f8b-fa43ae5fc829\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8') as f, open('scratch_refs.txt', 'w', encoding='utf-8') as out:
    for line in f:
        if 'page.tsx' in line.lower():
            try:
                obj = json.loads(line)
            except:
                continue
            idx = obj.get('step_index')
            tool_calls = obj.get('tool_calls', [])
            for tc in tool_calls:
                args = tc.get('args') or tc.get('arguments') or {}
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except:
                        pass
                if isinstance(args, dict):
                    for k, v in args.items():
                        if isinstance(v, str) and 'page.tsx' in v.lower():
                            out.write(f"Step: {idx} Tool: {tc.get('name')} Key: {k} Val: {v[:120]}\n")
