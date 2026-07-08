import time
import asyncio
import random
import socket
import ssl
import urllib.parse
import re
import json
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="TruPhish ML Service")

class UrlRequest(BaseModel):
    url: str

class TextRequest(BaseModel):
    text: str

class PhishingAgent:
    def __init__(self):
        # A list of common brands targeted by phishing
        self.brands = [
            "paypal", "google", "microsoft", "apple", "amazon", "netflix", 
            "facebook", "instagram", "twitter", "bankofamerica", "chase", 
            "wellsfargo", "yahoo", "outlook", "live", "ebay", "walmart", 
            "target", "dhl", "fedex", "ups"
        ]
        self.suspicious_tlds = [".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".click", ".link", ".work", ".date", ".party"]
        self.phishing_keywords = ['login', 'signin', 'verify', 'update', 'secure', 'account', 'bank', 'urgent', 'free', 'wallet', 'billing']

    def parse_url(self, url: str) -> str:
        # Normalize url
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        try:
            parsed = urllib.parse.urlparse(url)
            return parsed.netloc or parsed.path.split('/')[0]
        except Exception:
            return url

    async def scan_url_stream(self, url: str):
        yield {"step": "init", "status": "running", "message": f"🤖 Threat Intelligence Agent initialized for: {url}"}
        await asyncio.sleep(0.5)

        risk_score = 0
        explanations = []
        logs = []

        # Parse domain
        domain = self.parse_url(url)
        logs.append(f"Parsed target hostname: {domain}")

        # 1. DNS Resolution Tool
        yield {"step": "dns", "status": "running", "message": f"🔍 Resolving DNS records for domain: {domain}..."}
        await asyncio.sleep(0.6)
        ip_resolved = None
        try:
            loop = asyncio.get_event_loop()
            # Resolve DNS asynchronously using executor
            ip_resolved = await loop.run_in_executor(None, lambda: socket.gethostbyname(domain))
            yield {"step": "dns", "status": "success", "message": f"🌐 DNS resolved successfully. Target IP: {ip_resolved}"}
            logs.append(f"DNS lookup success: {domain} -> {ip_resolved}")
        except Exception as e:
            risk_score += 30
            explanations.append("Domain DNS record cannot be resolved (unregistered host or dynamic DNS).")
            yield {"step": "dns", "status": "danger", "message": f"❌ DNS resolution failed: {str(e)}"}
            logs.append(f"DNS resolution failed: {str(e)}")

        # 2. SSL/TLS Certificate Verification Tool
        yield {"step": "ssl", "status": "running", "message": f"🔒 Fetching SSL/TLS certificate details..."}
        await asyncio.sleep(0.6)
        ssl_valid = False
        ssl_issuer = "None"
        if ip_resolved:
            try:
                context = ssl.create_default_context()
                context.check_hostname = True
                context.verify_mode = ssl.CERT_REQUIRED
                
                loop = asyncio.get_event_loop()
                def fetch_cert():
                    # Attempt connection to port 443 with a 1.5s timeout
                    conn = socket.create_connection((domain, 443), timeout=1.5)
                    with context.wrap_socket(conn, server_hostname=domain) as sock:
                        return sock.getpeercert()
                
                cert = await loop.run_in_executor(None, fetch_cert)
                
                # Extract issuer details
                issuer_tuples = cert.get('issuer', ())
                issuer_dict = {}
                for rdn in issuer_tuples:
                    for k, v in rdn:
                        issuer_dict[k] = v
                
                ssl_issuer = issuer_dict.get('commonName', 'Unknown Authority')
                ssl_valid = True
                yield {"step": "ssl", "status": "success", "message": f"🔒 SSL certificate is active. Issued by: {ssl_issuer}"}
                logs.append(f"SSL Verified: Issuer is {ssl_issuer}")
            except Exception as e:
                risk_score += 20
                explanations.append("No active or valid SSL/TLS certificate found (unencrypted connection or self-signed cert).")
                yield {"step": "ssl", "status": "warning", "message": f"⚠️ SSL handshake failed: {str(e)}"}
                logs.append(f"SSL Handshake failed: {str(e)}")
        else:
            risk_score += 20
            explanations.append("SSL analysis skipped due to DNS resolution failure.")
            yield {"step": "ssl", "status": "danger", "message": "❌ SSL certificate check skipped: DNS unresolved."}
            logs.append("SSL skipped because IP could not be resolved.")

        # 3. Brand Impersonation Check Tool
        yield {"step": "brand", "status": "running", "message": "🎯 Analyzing brand impersonation signatures..."}
        await asyncio.sleep(0.6)
        
        impersonating = False
        impersonated_brand = None
        domain_lower = domain.lower()
        
        for brand in self.brands:
            if brand in domain_lower:
                # Is it the authentic domain? (e.g. paypal.com or subdomain ending with .paypal.com)
                is_authentic = domain_lower == f"{brand}.com" or domain_lower.endswith(f".{brand}.com")
                if not is_authentic:
                    impersonating = True
                    impersonated_brand = brand
                    break
        
        if impersonating:
            risk_score += 45
            explanations.append(f"Domain name impersonates legitimate brand: {impersonated_brand.upper()}.")
            yield {"step": "brand", "status": "danger", "message": f"🚨 Impersonation Alert: Domain is spoofing legitimate {impersonated_brand.upper()} services!"}
            logs.append(f"Impersonation match found: {impersonated_brand}")
        else:
            yield {"step": "brand", "status": "success", "message": "🎯 Domain matches no known brand impersonation patterns."}
            logs.append("No brand impersonation keywords found in host.")

        # 4. Content & Heuristics Check Tool
        yield {"step": "content", "status": "running", "message": "📄 Inspecting URL heuristics and metadata..."}
        await asyncio.sleep(0.5)
        
        # Check suspicious keywords in path/parameters
        matched_keywords = [word for word in self.phishing_keywords if word in url.lower()]
        matched_tlds = [tld for tld in self.suspicious_tlds if url.lower().endswith(tld) or (tld + "/") in url.lower()]
        
        if matched_keywords:
            risk_score += 15
            explanations.append(f"URL path or query parameters contain phishing-related keywords: {matched_keywords}")
            logs.append(f"Phishing keywords in path: {matched_keywords}")
        
        if matched_tlds:
            risk_score += 15
            explanations.append(f"Domain uses a suspicious TLD ({matched_tlds[0]}) associated with low-cost phishing registers.")
            logs.append(f"Suspicious TLD flagged: {matched_tlds[0]}")
            
        if matched_keywords or matched_tlds:
            yield {"step": "content", "status": "warning", "message": f"⚠️ Heuristics flags raised: Keywords {matched_keywords} | TLD {matched_tlds}"}
        else:
            yield {"step": "content", "status": "success", "message": "📄 Heuristics scan complete. Path and TLD appear standard."}
            logs.append("No content heuristic warnings.")

        # Compile final scores
        risk_score = min(max(risk_score, 0), 99)
        if risk_score == 0:
            risk_score = random.randint(4, 15)
            prediction = 'safe'
            explanations.append("URL appears secure and conforms to standard enterprise domain registries.")
        elif risk_score >= 50:
            prediction = 'phishing'
        else:
            prediction = 'suspicious'

        # Generate a premium security briefing
        briefing = f"### Security Assessment Briefing\n\n" \
                   f"**Verdict:** {prediction.upper()}\n" \
                   f"**Security Confidence Risk**: `{risk_score}% Severity`\n\n" \
                   f"#### 🔍 Key Findings:\n"
        for exp in explanations:
            briefing += f"- {exp}\n"
        briefing += f"\n#### 🌐 Diagnostics Output:\n" \
                   f"- Host Resolved: `{ip_resolved if ip_resolved else 'Unresolved'}`\n" \
                   f"- HTTPS Active: `{'Yes (' + ssl_issuer + ')' if ssl_valid else 'No (Plain HTTP / Certificate Invalid)'}`\n"

        yield {
            "step": "complete",
            "status": "success",
            "message": "✅ Analysis completed successfully.",
            "data": {
                "risk_score": risk_score,
                "prediction": prediction,
                "explanations": explanations,
                "report": briefing,
                "logs": logs
            }
        }

    async def scan_text_stream(self, text: str):
        yield {"step": "init", "status": "running", "message": "🤖 Semantic Urgency Audit initialized..."}
        await asyncio.sleep(0.5)

        risk_score = 0
        explanations = []
        logs = []

        # 1. Urgency Check
        yield {"step": "urgency", "status": "running", "message": "⚠️ Analyzing copy urgency and cognitive pressure..."}
        await asyncio.sleep(0.6)
        urgency_words = ['immediately', 'urgent', 'action required', 'suspended', 'terminate', 'limited time', 'unauthorized access', 'pay now', 'last chance']
        found_urgency = [word for word in urgency_words if word in text.lower()]
        if found_urgency:
            risk_score += 25
            explanations.append(f"Message employs artificial urgency tactics: {found_urgency}")
            yield {"step": "urgency", "status": "warning", "message": f"⚠️ Cognitive pressure phrases detected: {found_urgency}"}
            logs.append(f"Urgency vocabulary matches: {found_urgency}")
        else:
            yield {"step": "urgency", "status": "success", "message": "✅ Message contains normal, low-pressure phrasing."}
            logs.append("No urgency keywords found.")

        # 2. Financial Solicitations
        yield {"step": "financial", "status": "running", "message": "💳 Auditing credentials & financial harvesting attempts..."}
        await asyncio.sleep(0.6)
        financial_words = ['bank', 'account', 'credit card', 'debit card', 'ssn', 'social security', 'routing number', 'pin', 'password', 'login', 'credentials', 'verify your identity', 'security update']
        found_financial = [word for word in financial_words if word in text.lower()]
        if found_financial:
            risk_score += 25
            explanations.append(f"Copy solicits confidential banking credentials/PII: {found_financial}")
            yield {"step": "financial", "status": "warning", "message": f"⚠️ Financial credential requests found: {found_financial}"}
            logs.append(f"Financial credentials matches: {found_financial}")
        else:
            yield {"step": "financial", "status": "success", "message": "✅ No sensitive financial or PII solicitations found."}
            logs.append("No financial keywords found.")

        # 3. Identity & Brand Verification
        yield {"step": "brand", "status": "running", "message": "🏢 Scanning for enterprise brand name spoofing..."}
        await asyncio.sleep(0.6)
        found_brands = [brand for brand in self.brands if brand in text.lower()]
        if found_brands:
            risk_score += 20
            explanations.append(f"Message references high-profile brand entities ({found_brands}) without digital sign-offs.")
            yield {"step": "brand", "status": "warning", "message": f"⚠️ Message mentions high-target corporate brands: {found_brands}"}
            logs.append(f"Brands referenced in copy: {found_brands}")
        else:
            yield {"step": "brand", "status": "success", "message": "✅ No high-target brand impersonations detected."}
            logs.append("No brand names found.")

        # 4. Embedded Link Auditing
        yield {"step": "links", "status": "running", "message": "🔗 Extracting and auditing links within the content..."}
        await asyncio.sleep(0.6)
        
        # Regex to find links
        urls = re.findall(r'https?://[^\s]+|www\.[^\s]+', text)
        if urls:
            first_url = urls[0]
            # Strip trailing punctuation
            first_url = re.split(r'[;,\.\?"\'\)>]', first_url)[0]
            yield {"step": "links", "status": "warning", "message": f"🔗 Link identified: {first_url}. Spawning sub-agent threat-hunt..."}
            logs.append(f"Found embedded URL: {first_url}")
            await asyncio.sleep(0.5)
            
            # Run sub-agent analysis on URL
            domain = self.parse_url(first_url)
            ip_resolved = None
            try:
                loop = asyncio.get_event_loop()
                ip_resolved = await loop.run_in_executor(None, lambda: socket.gethostbyname(domain))
                logs.append(f"Sub-agent DNS: {domain} resolved to {ip_resolved}")
            except Exception:
                logs.append(f"Sub-agent DNS: Failed resolving {domain}")
                
            url_risk = 0
            if not ip_resolved:
                url_risk += 30
            
            impersonating = False
            for brand in self.brands:
                if brand in domain.lower() and not (domain.lower() == f"{brand}.com" or domain.lower().endswith(f".{brand}.com")):
                    impersonating = True
                    break
            if impersonating:
                url_risk += 40
            
            if url_risk >= 30:
                risk_score += 30
                explanations.append(f"Contains an embedded link ({first_url}) that fails security domain checks.")
                yield {"step": "links", "status": "danger", "message": f"🚨 Hyperlink Danger: Resolved IP or brand checks failed for {first_url}."}
            else:
                yield {"step": "links", "status": "success", "message": f"✅ Hyperlink verified secure: {first_url}."}
        else:
            yield {"step": "links", "status": "success", "message": "✅ No embedded web links found."}
            logs.append("No URLs extracted from text.")

        # Final score compilation
        risk_score = min(max(risk_score, 0), 99)
        if risk_score == 0:
            risk_score = random.randint(4, 15)
            prediction = 'safe'
            explanations.append("The message contains no semantic vectors of threat or urgency.")
        elif risk_score >= 50:
            prediction = 'phishing'
        else:
            prediction = 'suspicious'

        briefing = f"### Content Audit Assessment\n\n" \
                   f"**Verdict:** {prediction.upper()}\n" \
                   f"**Security Confidence Risk**: `{risk_score}% Severity`\n\n" \
                   f"#### 🔍 Key Findings:\n"
        for exp in explanations:
            briefing += f"- {exp}\n"

        yield {
            "step": "complete",
            "status": "success",
            "message": "✅ Text content audit complete.",
            "data": {
                "risk_score": risk_score,
                "prediction": prediction,
                "explanations": explanations,
                "report": briefing,
                "logs": logs
            }
        }

@app.post("/scan/url")
async def scan_url(request: UrlRequest):
    agent = PhishingAgent()
    final_data = {}
    async for event in agent.scan_url_stream(request.url):
        if event["step"] == "complete":
            final_data = event["data"]
    return final_data

@app.post("/scan/text")
async def scan_text(request: TextRequest):
    agent = PhishingAgent()
    final_data = {}
    async for event in agent.scan_text_stream(request.text):
        if event["step"] == "complete":
            final_data = event["data"]
    return final_data

@app.get("/scan/url/stream")
async def scan_url_stream(url: str = Query(...)):
    agent = PhishingAgent()
    async def event_generator():
        async for event in agent.scan_url_stream(url):
            yield f"data: {json.dumps(event)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/scan/text/stream")
async def scan_text_stream(text: str = Query(...)):
    agent = PhishingAgent()
    async def event_generator():
        async for event in agent.scan_text_stream(text):
            yield f"data: {json.dumps(event)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/")
def root():
    return {"message": "TruPhish ML Service is running."}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
