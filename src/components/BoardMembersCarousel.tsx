import { useLanguage } from "@/contexts/LanguageContext";
import { ProfileCardCarousel, ProfileCardItem } from "@/components/ui/profile-card-testimonial-carousel";

interface BoardMember {
    nameBg: string;
    nameEn: string;
    roleBg: string;
    roleEn: string;
    image: string;
    linkedinUrl?: string;
}

const BOARD_MEMBERS: BoardMember[] = [
    { nameBg: "КУЗО ДОНЧЕВ", nameEn: "KUZO DONCHEV", roleBg: "Председател", roleEn: "Chairman", image: "/team/kuzo_donchev.webp" },
    { nameBg: "БОЯН ПЕХЛИВАНОВ", nameEn: "BOYAN PEHLIVANOV", roleBg: "Заместник-председател", roleEn: "Vice Chairman", image: "/team/boyan_pehlevanov.webp" },
    { nameBg: "НИКОЛАЙ ЙОРДАНОВ", nameEn: "NIKOLAY YORDANOV", roleBg: "Член на УС", roleEn: "Board Member", image: "/team/nikolay_yordanov.webp" },
    { nameBg: "ГЕОРГИ ТОЛЕВ", nameEn: "GEORGI TOLEV", roleBg: "Член на УС", roleEn: "Board Member", image: "/team/georgi_tolev.webp" },
    { nameBg: "КРАСИМИР ГЕОРГИЕВ", nameEn: "KRASIMIR GEORGIEV", roleBg: "Член на УС", roleEn: "Board Member", image: "/team/krasimir_georgiev.webp" },
    { nameBg: "ЛЮБОМИР ГЕРАСИМОВ", nameEn: "LYUBOMIR GERASIMOV", roleBg: "Член на УС", roleEn: "Board Member", image: "/team/lyubomir_gerasimov.webp" },
    { nameBg: "ВАСИЛ НИКОЛОВ", nameEn: "VASIL NIKOLOV", roleBg: "Член на УС", roleEn: "Board Member", image: "/team/vasil_nikolov.webp" },
    { nameBg: "ДАНИЕЛ ХРИСТЕВ", nameEn: "DANIEL HRISTEV", roleBg: "Член на УС", roleEn: "Board Member", image: "/team/daniel_hristev.webp" },
    { nameBg: "АНДРЕЙ ДУНИЦОВ", nameEn: "ANDREY DUNITSOV", roleBg: "Член на УС", roleEn: "Board Member", image: "/team/andrey_dunitsov.webp" },
    { nameBg: "ДИМО ДИМОВ", nameEn: "DIMO DIMOV", roleBg: "Член на УС", roleEn: "Board Member", image: "" },
];

/**
 * Board of Directors — profile-card slideshow (one member at a time with
 * photo + overlapping info card, prev/next arrows, dots and a slow
 * auto-advance). Replaces the old continuously-scrolling vertical carousel.
 */
const BoardMembersCarousel = () => {
    const { language } = useLanguage();

    const items: ProfileCardItem[] = BOARD_MEMBERS.map((m) => ({
        name: language === "bg" ? m.nameBg : m.nameEn,
        title: language === "bg" ? m.roleBg : m.roleEn,
        imageUrl: m.image,
        linkedinUrl: m.linkedinUrl,
    }));

    return (
        /* Backdrop panel — separates the slideshow from the busy Bulgaria-map
           artwork behind this section. */
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-primary/10 bg-background/70 p-4 backdrop-blur-md sm:p-6">
            <ProfileCardCarousel
                items={items}
                imageFit="contain"
                autoAdvanceMs={6000}
                prevLabel={language === "bg" ? "Предишен член" : "Previous member"}
                nextLabel={language === "bg" ? "Следващ член" : "Next member"}
            />
        </div>
    );
};

export default BoardMembersCarousel;
