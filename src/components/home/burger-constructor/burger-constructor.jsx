import "@ya.praktikum/react-developer-burger-ui-components";
import React, { useState, useEffect } from "react";
import styles from "./burger-constructor.module.css";
import {
    Button,
    CurrencyIcon,
    ConstructorElement,
    DragIcon,
} from "@ya.praktikum/react-developer-burger-ui-components";
import { OrderDetails } from "../../order-details/order-details";
import Modal from "../../modal/modal";
import { INGREDIENT_TYPES } from "../../../utils/ingredient-types";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrderDetails } from "../../../services/order-details-slice";
import { useDrop } from "react-dnd";
import { addIngredient } from "../../../services/constructor-slice";
import Card from "./card";
import { deleteIngredient } from "../../../services/constructor-slice";
import { useNavigate } from "react-router-dom";

const BurgerConstructor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { bun, mainIngredients } = useSelector(
        (state) => state.burgerConstructor
    );
    const { orderDetails } = useSelector((state) => state.orderDetails);
    const {loginSuccess} = useSelector((state) => state.user);

    // Считаем Тотал
    const totalMainIngredients = mainIngredients.reduce(
        (acc, ingredient) => acc + ingredient.price,
        0
    );

    const totalBuns = bun.reduce((acc, bun) => acc + bun.price, 0) * 2;
    const totalPrice = totalMainIngredients + totalBuns;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loginSuccess) {
            // Айдишички для Поста считаем только при клике "оформить заказ"
            const mainIngredientsIds = mainIngredients.map(
                (ingredient) => ingredient._id
            );
            const bunsIds = bun.map((ingredient) => ingredient._id);
            const allIngredientIds = [
                ...bunsIds,
                ...mainIngredientsIds,
                ...bunsIds,
            ];
    
            dispatch(fetchOrderDetails(allIngredientIds));
        } else{
            navigate('/login');
        }
    };

    useEffect(() => {
        if (orderDetails.success) {
            handleOpen();
        }
    }, [orderDetails]);

    // Модуль
    const [isModalOpened, setIsModalOpened] = useState(false);

    const handleClose = () => {
        setIsModalOpened(false);
    };

    const handleOpen = () => {
        setIsModalOpened(true);
    };

    // DND
    const [{ canDrop }, drop] = useDrop(() => ({
        accept: "ingredient",
        drop: (ingredient) => {
            dispatch(addIngredient(ingredient.ingredient));
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <section className={styles.wrapper}>
            <ul
                ref={drop}
                className={`${styles.container} ${
                    canDrop ? styles.canDrop : null
                }`}
            >
                {/* ВЕРХНЯЯ БУЛКА */}
                <div className={styles.paddingRight}>
                    {bun &&
                        bun.map((ingredient, index) => (
                            <li key={index}>
                                <ConstructorElement
                                    type="top"
                                    isLocked={true}
                                    text={ingredient.name + " (верх)"}
                                    price={ingredient.price}
                                    thumbnail={ingredient.image}
                                />
                            </li>
                        ))}
                </div>
                {/* ОСНОВНЫЕ ИНГРЕДИЕНТЫ */}
                <div className={styles.ingredients}>
                    {mainIngredients &&
                        mainIngredients.map((ingredient, index) => (
                            <li className={styles.containerRow} key={index}>
                                <Card
                                    key={ingredient._id}
                                    id={ingredient._id}
                                    index={index}
                                >
                                    <DragIcon />
                                    <ConstructorElement
                                        text={ingredient.name}
                                        price={ingredient.price}
                                        thumbnail={ingredient.image}
                                        handleClose={() =>
                                            dispatch(
                                                deleteIngredient(ingredient)
                                            )
                                        }
                                    />
                                </Card>
                            </li>
                        ))}
                </div>
                {/* НИЖНЯЯ БУЛКА */}
                <div className={styles.paddingRight}>
                    {bun &&
                        bun.map((ingredient, index) => (
                            <li key={index}>
                                <ConstructorElement
                                    type="bottom"
                                    isLocked={true}
                                    text={ingredient.name + " (низ)"}
                                    price={ingredient.price}
                                    thumbnail={ingredient.image}
                                />
                            </li>
                        ))}
                </div>
            </ul>
            <div className={styles.containerTotal}>
                <div className={styles.containerRow}>
                    {/* Цена */}
                    <p className="text text_type_digits-medium">{totalPrice}</p>
                    <CurrencyIcon type="primary" />
                </div>
                {/* Кнопка оформить заказ */}
                <Button type="primary" size="large" onClick={handleSubmit}>
                    Оформить заказ
                </Button>
            </div>
            {orderDetails.success && (
                <Modal isOpened={isModalOpened} onClose={handleClose}>
                    <OrderDetails orderNumber={orderDetails.order.number} />
                </Modal>
            )}
        </section>
    );
};

export default BurgerConstructor;
