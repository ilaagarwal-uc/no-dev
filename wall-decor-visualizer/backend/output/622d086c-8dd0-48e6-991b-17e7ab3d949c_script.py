OUTPUT_PATH = '/tmp/622d086c-8dd0-48e6-991b-17e7ab3d949c.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Height: 9'
    - Total Width: 7' (left section) + 7'6" (right section) = 14'6"
    - Opening (Door/AC area): 7' wide by 8' high, located at the left edge.
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    ft_to_m = 0.3048
    
    # Wall dimensions
    wall_width_ft = 14.5  # 7' + 7.5'
    wall_height_ft = 9.0
    wall_depth_ft = 0.5   # Standard assumed thickness
    
    # Opening dimensions
    opening_width_ft = 7.0
    opening_height_ft = 8.0
    
    # Convert to meters
    w_w = wall_width_ft * ft_to_m
    w_h = wall_height_ft * ft_to_m
    w_d = wall_depth_ft * ft_to_m
    
    o_w = opening_width_ft * ft_to_m
    o_h = opening_height_ft * ft_to_m
    
    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (w_w, w_d, w_h)
    # Position so the bottom-left corner is at the origin (0,0,0)
    wall.location = (w_w / 2, w_d / 2, w_h / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # 2. Create the Opening (Door/Window area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening"
    # Scale opening; depth is doubled to ensure a clean boolean cut
    opening.scale = (o_w, w_d * 2, o_h)
    # Position at the left edge of the wall
    opening.location = (o_w / 2, w_d / 2, o_h / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # 3. Apply Boolean Difference to create the structural hole
    bool_mod = wall.modifiers.new(name="WallOpening", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)
    
    # 4. Clean up: Remove the opening helper object
    bpy.data.objects.remove(opening, do_unlink=True)
    
    # 5. Export to GLB format
    # Headless blender will save this to the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/622d086c-8dd0-48e6-991b-17e7ab3d949c.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()