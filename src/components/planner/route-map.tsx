"use client";

import { useEffect, useRef, useState } from "react";
import type { RouteStop } from "@/lib/types";

type RouteMapProps = {
  route: RouteStop[];
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!;
  });
}

export function RouteMap({ route }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AMAP_KEY;
    const securityJsCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE;

    if (!key || !containerRef.current || route.length === 0) {
      return;
    }

    const amapKey = key;
    const amapSecurityCode = securityJsCode ?? "";
    let cancelled = false;

    async function render() {
      try {
        // securityJsCode must be set before the JS API script loads
        if (amapSecurityCode) {
          (window as unknown as { _AMapSecurityConfig?: { securityJsCode: string } })._AMapSecurityConfig = {
            securityJsCode: amapSecurityCode
          };
        }

        const AMapLoader = (await import("@amap/amap-jsapi-loader")).default;
        const AMap = await AMapLoader.load({
          key: amapKey,
          version: "2.0"
        });

        if (cancelled || !containerRef.current) {
          return;
        }

        // 容器需完成布局，否则高德按 0 尺寸初始化会算出 NaN
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        if (cancelled || !containerRef.current) {
          return;
        }

        const map = new AMap.Map(containerRef.current, {
          zoom: 4,
          center: [route[0].coordinates.lng, route[0].coordinates.lat],
          viewMode: "2D"
        });
        mapRef.current = map;

        const path = route.map((stop) => [stop.coordinates.lng, stop.coordinates.lat]);
        new AMap.Polyline({
          path,
          strokeColor: "#14766c",
          strokeWeight: 4,
          strokeOpacity: 0.9,
          lineJoin: "round"
        }).setMap(map);

        const markers = route.map((stop, index) => {
          const content = `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none">
            <div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#db4d5c;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>
            <div style="padding:2px 8px;border-radius:6px;background:#fff;color:#111;font:600 12px/1.5 sans-serif;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25)">${escapeHtml(stop.city)}</div>
          </div>`;

          const marker = new AMap.Marker({
            position: [stop.coordinates.lng, stop.coordinates.lat],
            content,
            offset: new AMap.Pixel(-13, -13)
          });
          marker.setMap(map);

          return marker;
        });

        map.setFitView(markers, false, [48, 48, 48, 48]);
      } catch (error) {
        console.error("高德地图加载失败", error);
        setFailed(true);
      }
    }

    render();

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
      // StrictMode 会双调用 effect，必须清空容器，否则高德读到残留状态算出 NaN
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [route]);

  if (!process.env.NEXT_PUBLIC_AMAP_KEY) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        配置 NEXT_PUBLIC_AMAP_KEY 后显示高德路线地图
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        高德地图加载失败，请检查 Key 与安全密钥是否正确、是否勾选了「Web端(JS API)」
      </div>
    );
  }

  return <div ref={containerRef} className="h-80 overflow-hidden rounded-lg border" />;
}
