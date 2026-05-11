import { useEffect, useRef, useCallback } from 'react'

const THRESHOLD  = 18  // acceleration delta to trigger shake
const COOLDOWN   = 2000 // ms between shakes

export function useShake(onShake) {
  const lastShake = useRef(0)
  const lastAcc   = useRef({ x: null, y: null, z: null })
  const enabled   = useRef(false)

  const handleMotion = useCallback((e) => {
    if (!enabled.current) return
    const acc = e.accelerationIncludingGravity
    if (!acc) return

    const { x = 0, y = 0, z = 0 } = acc
    const prev = lastAcc.current

    if (prev.x !== null) {
      const delta = Math.abs(x - prev.x) + Math.abs(y - prev.y) + Math.abs(z - prev.z)
      const now = Date.now()
      if (delta > THRESHOLD && now - lastShake.current > COOLDOWN) {
        lastShake.current = now
        if (navigator.vibrate) navigator.vibrate(30)
        onShake()
      }
    }

    lastAcc.current = { x, y, z }
  }, [onShake])

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
      try {
        const result = await DeviceMotionEvent.requestPermission()
        if (result === 'granted') {
          enabled.current = true
          window.addEventListener('devicemotion', handleMotion)
        }
      } catch (err) {
        console.warn('Shake permission denied:', err)
      }
    } else {
      // Android and older iOS — no permission needed
      enabled.current = true
      window.addEventListener('devicemotion', handleMotion)
    }
  }, [handleMotion])

  useEffect(() => {
    // Only enable on mobile devices
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!isMobile) return

    requestPermission()

    return () => {
      enabled.current = false
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [requestPermission, handleMotion])

  return { requestPermission }
}
