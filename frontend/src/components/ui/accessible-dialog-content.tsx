import React, { useEffect, useRef } from 'react';

interface AccessibleDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A wrapper component that ensures dialog content remains accessible
 * even when aria-hidden is applied by the dialog library.
 * This fixes the "aria-hidden on focused element" accessibility issue.
 */
export const AccessibleDialogContent: React.FC<AccessibleDialogContentProps> = ({ 
  children, 
  className 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          const target = mutation.target as HTMLElement;
          
          // If aria-hidden is set to true, check for focused elements
          if (target.getAttribute('aria-hidden') === 'true') {
            const focusedElement = target.querySelector(':focus') as HTMLElement;
            const focusableElements = target.querySelectorAll(
              'input, select, textarea, button, [tabindex]:not([tabindex="-1"]), [contenteditable]'
            );
            
            // If there are focusable elements, remove aria-hidden
            // or if there's a currently focused element
            if (focusedElement || focusableElements.length > 0) {
              target.removeAttribute('aria-hidden');
              
              // Add a custom attribute to indicate we've handled this
              target.setAttribute('data-accessible-dialog', 'true');
              
              console.debug('Removed aria-hidden from dialog with focusable elements');
            }
          }
        }
      });
    });

    // Observe the content element and its parent
    if (contentRef.current) {
      observer.observe(contentRef.current, { 
        attributes: true, 
        attributeFilter: ['aria-hidden'],
        subtree: true 
      });
      
      // Also observe the parent element (Radix dialog content)
      const parent = contentRef.current.parentElement;
      if (parent) {
        observer.observe(parent, { 
          attributes: true, 
          attributeFilter: ['aria-hidden'] 
        });
      }
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={contentRef} className={className} data-accessible-dialog-wrapper="true">
      {children}
    </div>
  );
};