'use client';

import {
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';

import styles from './BackofficeShell.module.css';


type IconName =
    | 'apps'
    | 'page'
    | 'calendar'
    | 'pin'
    | 'person'
    | 'warning'
    | 'mail'
    | 'menu'
    | 'qr'
    | 'bot'
    | 'group'
    | 'tree'
    | 'stack'
    | 'collapse'
    | 'home'
    | 'chevron'
    | 'building';


function Icon({
    name,
    size = 18,
}: {
    name: IconName;
    size?: number;
}) {
    const common = {
        width:
            size,
        height:
            size,
        viewBox:
            '0 0 24 24',
        fill:
            'none',
        stroke:
            'currentColor',
        strokeWidth:
            1.8,
        strokeLinecap:
            'round' as const,
        strokeLinejoin:
            'round' as const,
        'aria-hidden':
            true,
    };

    if (
        name === 'apps'
    ) {
        return (
            <svg {...common}>
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
        );
    }

    if (
        name === 'page'
    ) {
        return (
            <svg {...common}>
                <path d="M7 3h8l4 4v14H7z" />
                <path d="M15 3v5h5" />
                <path d="M10 12h6M10 16h6" />
            </svg>
        );
    }

    if (
        name === 'calendar'
    ) {
        return (
            <svg {...common}>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M7 3v4M17 3v4M3 10h18" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
        );
    }

    if (
        name === 'pin'
    ) {
        return (
            <svg {...common}>
                <path d="M12 21s6-5.2 6-11A6 6 0 0 0 6 10c0 5.8 6 11 6 11z" />
                <circle cx="12" cy="10" r="2.2" />
                <path d="M18.5 4.5 21 2" />
                <path d="M19 2h2v2" />
            </svg>
        );
    }

    if (
        name === 'person'
    ) {
        return (
            <svg {...common}>
                <path d="M8 20c.7-3.8 2.1-5.7 4-5.7s3.3 1.9 4 5.7" />
                <circle cx="12" cy="8" r="3" />
                <path d="M5 20h14" />
            </svg>
        );
    }

    if (
        name === 'warning'
    ) {
        return (
            <svg {...common}>
                <path d="m12 3 9 17H3z" />
                <path d="M12 9v4M12 17h.01" />
            </svg>
        );
    }

    if (
        name === 'mail'
    ) {
        return (
            <svg {...common}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
            </svg>
        );
    }

    if (
        name === 'menu'
    ) {
        return (
            <svg {...common}>
                <path d="M5 6h14M5 12h14M5 18h14" />
            </svg>
        );
    }

    if (
        name === 'qr'
    ) {
        return (
            <svg {...common}>
                <rect x="3" y="3" width="6" height="6" />
                <rect x="15" y="3" width="6" height="6" />
                <rect x="3" y="15" width="6" height="6" />
                <path d="M15 15h2v2h-2zM19 15h2v6h-2M15 19h2v2h-2" />
            </svg>
        );
    }

    if (
        name === 'bot'
    ) {
        return (
            <svg {...common}>
                <rect x="5" y="7" width="14" height="11" rx="3" />
                <path d="M12 3v4M9 12h.01M15 12h.01M8 21v-3M16 21v-3" />
            </svg>
        );
    }

    if (
        name === 'group'
    ) {
        return (
            <svg {...common}>
                <circle cx="8" cy="9" r="2.5" />
                <circle cx="16.5" cy="8" r="2" />
                <path d="M3.5 20c.5-4 2-6 4.5-6s4 2 4.5 6" />
                <path d="M13.5 14c2.8 0 4.6 2 5 5" />
            </svg>
        );
    }

    if (
        name === 'tree'
    ) {
        return (
            <svg {...common}>
                <path d="M12 3 8 9h2l-4 6h4v6h4v-6h4l-4-6h2z" />
            </svg>
        );
    }

    if (
        name === 'stack'
    ) {
        return (
            <svg {...common}>
                <path d="m12 3 8 4-8 4-8-4z" />
                <path d="m4 12 8 4 8-4" />
                <path d="m4 17 8 4 8-4" />
            </svg>
        );
    }

    if (
        name === 'collapse'
    ) {
        return (
            <svg {...common}>
                <path d="M5 7h14M5 12h10M5 17h14" />
                <path d="m3 12 3-3v6z" />
            </svg>
        );
    }

    if (
        name === 'home'
    ) {
        return (
            <svg {...common}>
                <path d="m3 11 9-8 9 8" />
                <path d="M5 10v10h14V10" />
            </svg>
        );
    }

    if (
        name === 'chevron'
    ) {
        return (
            <svg {...common}>
                <path d="m9 6 6 6-6 6" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <path d="M4 21V9h16v12" />
            <path d="M7 9V5h10v4M8 13h2M14 13h2M8 17h2M14 17h2" />
            <path d="M2 21h20" />
        </svg>
    );
}


const railItems:
    IconName[] = [
        'apps',
        'page',
        'calendar',
        'pin',
        'person',
        'warning',
        'mail',
        'menu',
        'qr',
        'bot',
        'group',
        'tree',
    ];


const pageItems = [
    'Páginas',
    'Modelos',
];

const otherPages = [
    'Homepage',
    'Serviços',
    'Header & Menu',
    'Footer',
    'Cookies',
    'Acessos Barra Lateral',
];

const settings = [
    'Mural Social',
    'Estatísticas',
    'Redirecionamentos',
    'Definições',
];

const reserved = [
    'Páginas',
    'Modelos',
    'Utilizadores',
    'Grupo de Utilizadores',
];


const municipalities = [
    'Alcobaça',
    'Olhão',
    'Lourinhã',
];


function NavItem({
    children,
    bold = false,
    icon = 'page',
}: {
    children:
        ReactNode;
    bold?:
        boolean;
    icon?:
        IconName;
}) {
    return (
        <div
            className={
                `${styles.navItem} ${
                    bold
                        ? styles.navItemBold
                        : ''
                }`
            }
        >
            <Icon
                name={icon}
                size={14}
            />

            <span>
                {children}
            </span>
        </div>
    );
}


function SiteMunicipalityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMunicipality, setSelectedMunicipality] = useState(
        municipalities[0]
    );
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function closeOnOutsideClick(event: PointerEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsOpen(false);
            }
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener(
            'pointerdown',
            closeOnOutsideClick
        );
        document.addEventListener(
            'keydown',
            closeOnEscape
        );

        return () => {
            document.removeEventListener(
                'pointerdown',
                closeOnOutsideClick
            );
            document.removeEventListener(
                'keydown',
                closeOnEscape
            );
        };
    }, [isOpen]);

    return (
        <div
            ref={
                menuRef
            }
            className={
                `${styles.siteMenu} ${
                    isOpen
                        ? styles.siteMenuOpen
                        : ''
                }`
            }
        >
            <button
                type="button"
                className={
                    styles.siteButton
                }
                aria-haspopup="menu"
                aria-expanded={
                    isOpen
                }
                aria-controls="site-municipalities"
                onClick={() => {
                    setIsOpen(
                        (open) => !open
                    );
                }}
            >
                <Icon
                    name="building"
                    size={16}
                />

                <span>
                    {selectedMunicipality}
                </span>

                <span
                    className={
                        styles.siteButtonChevron
                    }
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div
                    id="site-municipalities"
                    className={
                        styles.siteDropdown
                    }
                    role="menu"
                >
                    {municipalities.map(
                        (municipality) => (
                            <button
                                key={
                                    municipality
                                }
                                type="button"
                                className={
                                    styles.siteOption
                                }
                                role="menuitem"
                                onClick={() => {
                                    setSelectedMunicipality(
                                        municipality
                                    );
                                    setIsOpen(
                                        false
                                    );
                                }}
                            >
                                {municipality}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}


export function BackofficeShell({
    children,
}: {
    children:
        ReactNode;
}) {
    return (
        <div
            className={
                styles.shell
            }
        >
            <aside
                className={
                    styles.iconRail
                }
            >
                <div
                    className={
                        styles.logo
                    }
                    aria-label="Visualforma"
                >
                    V
                </div>

                <div
                    className={
                        styles.railItems
                    }
                >
                    {railItems.map(
                        (
                            item,
                            index
                        ) => (
                            <button
                                key={
                                    item +
                                    index
                                }
                                type="button"
                                className={
                                    `${styles.railButton} ${
                                        index ===
                                        0
                                            ? styles.railButtonActive
                                            : ''
                                    }`
                                }
                                aria-label={
                                    item
                                }
                            >
                                <Icon
                                    name={
                                        item
                                    }
                                />
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    className={
                        styles.railBottom
                    }
                    aria-label="Módulos"
                >
                    <Icon
                        name="stack"
                    />
                </button>
            </aside>


            <header
                className={
                    styles.topbar
                }
            >
                <div
                    className={
                        styles.demoBadge
                    }
                >
                    AUTARQUIA 360 DEMO
                </div>

                <div
                    className={
                        styles.topbarRight
                    }
                >
                    <SiteMunicipalityMenu />

                    <div
                        className={
                            styles.topDivider
                        }
                    />

                    <div
                        className={
                            styles.userBlock
                        }
                    >
                        <div>
                            <strong>
                                Jorge Guerreiro
                            </strong>

                            <span>
                                Administrador VF
                            </span>
                        </div>

                        <div
                            className={
                                styles.avatar
                            }
                        >
                            J
                        </div>

                        <span
                            className={
                                styles.userChevron
                            }
                        >
                           ⌄
                        </span>
                    </div>
                </div>
            </header>


            <div
                className={
                    styles.breadcrumb
                }
            >
                <Icon
                    name="home"
                    size={15}
                />

                <Icon
                    name="chevron"
                    size={12}
                />

                <span>
                    Site Autárquico
                </span>

                <Icon
                    name="chevron"
                    size={12}
                />

                <span>
                    Páginas
                </span>

                <Icon
                    name="chevron"
                    size={12}
                />

                <strong>
                    Editar Página
                </strong>
            </div>


            <aside
                className={
                    styles.navigation
                }
            >
                <div
                    className={
                        styles.navHeader
                    }
                >
                    <strong>
                        Site Autárquico
                    </strong>

                    <button
                        type="button"
                        className={
                            styles.collapseButton
                        }
                        aria-label="Recolher menu"
                    >
                        <Icon
                            name="collapse"
                            size={18}
                        />
                    </button>
                </div>

                <div
                    className={
                        styles.navScroll
                    }
                >
                    <section
                        className={
                            styles.navSection
                        }
                    >
                        <div
                            className={
                                styles.navLabel
                            }
                        >
                            Gestão de Páginas
                        </div>

                        {pageItems.map(
                            (
                                item,
                                index
                            ) => (
                                <NavItem
                                    key={
                                        item
                                    }
                                    bold={
                                        index ===
                                        0
                                    }
                                >
                                    {item}
                                </NavItem>
                            )
                        )}
                    </section>

                    <section
                        className={
                            styles.navSection
                        }
                    >
                        <div
                            className={
                                styles.navLabel
                            }
                        >
                            Gestão de Outras Páginas
                        </div>

                        {otherPages.map(
                            (
                                item
                            ) => (
                                <NavItem
                                    key={
                                        item
                                    }
                                >
                                    {item}
                                </NavItem>
                            )
                        )}
                    </section>

                    <section
                        className={
                            styles.navSection
                        }
                    >
                        <div
                            className={
                                styles.navLabel
                            }
                        >
                            Configurações
                        </div>

                        {settings.map(
                            (
                                item,
                                index
                            ) => (
                                <NavItem
                                    key={
                                        item
                                    }
                                    icon={
                                        index ===
                                        3
                                            ? 'group'
                                            : 'page'
                                    }
                                >
                                    {item}
                                </NavItem>
                            )
                        )}
                    </section>

                    <section
                        className={
                            styles.navSection
                        }
                    >
                        <div
                            className={
                                styles.navLabel
                            }
                        >
                            Área reservada
                        </div>

                        {reserved.map(
                            (
                                item
                            ) => (
                                <NavItem
                                    key={
                                        item
                                    }
                                >
                                    {item}
                                </NavItem>
                            )
                        )}
                    </section>
                </div>

                <button
                    type="button"
                    className={
                        styles.navFooterButton
                    }
                    aria-label="Recolher navegação"
                >
                    <Icon
                        name="collapse"
                    />
                </button>
            </aside>


            <main
                className={
                    styles.workspace
                }
            >
                {children}
            </main>
        </div>
    );
}
